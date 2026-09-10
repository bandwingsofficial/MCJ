import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentType, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import {
  ensureBatchSelectableForAssignment,
} from '@modules/batch/domain/utils/batch-selection.util';
import { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  assessmentPercentage,
  averagePercentageByType,
  countAssessmentsByType,
  ASSESSMENT_TYPES,
  listAssessmentTypesPresent,
  summarizeAssessmentMarks,
} from './assessment-analytics.util';
import { resolveBranchBatchTimingContext } from './utils/resolve-branch-timing-context.util';
import {
  formatAttendanceSessionLabel,
  toAttendanceSessionDto,
} from './attendance-session.util';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { addUtcDays, parseDateOnly } from './date.util';
import {
  FACULTY_VISIBLE_ENROLLMENT_STATUSES,
  facultyBatchStudentWhere,
  facultyBatchTimingActiveStudentWhere,
  facultyBranchEnrollmentWhere,
} from './faculty-batch-query';

export interface AssessmentListQuery {
  batchId?: string;
  batchCourseId?: string;
  studentId?: string;
  facultyId?: string;
  type?: AssessmentType;
  from?: string;
  to?: string;
  search?: string;
  skip?: number;
  take?: number;
}

const assessmentInclude = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
    },
  },
  batch: { select: { id: true, name: true, code: true } },
  faculty: {
    select: { id: true, firstName: true, lastName: true },
  },
  batchCourse: {
    select: {
      id: true,
      courseId: true,
      course: { select: { id: true, title: true, code: true } },
      session: { select: { id: true, sessionNumber: true } },
    },
  },
} satisfies Prisma.AcademicAssessmentInclude;

type AssessmentRow = Prisma.AcademicAssessmentGetPayload<{
  include: typeof assessmentInclude;
}>;

const enrollmentAssessmentInclude = {
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      studentCode: true,
      email: true,
      phone: true,
      status: true,
    },
  },
  batch: {
    select: { id: true, name: true, code: true, branchId: true },
  },
  batchTiming: {
    select: { id: true, name: true, mode: true },
  },
  course: {
    select: { id: true, title: true, code: true },
  },
  branch: {
    select: { id: true, branchName: true, branchCode: true },
  },
} satisfies Prisma.EnrollmentInclude;

type EnrollmentAssessmentRow = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentAssessmentInclude;
}>;

export interface StudentAssessmentRecordDto {
  id: string;
  assessmentGroupId: string | null;
  enrollmentId: string;
  date: Date;
  name: string;
  type: AssessmentType;
  batch: { id: string; name: string; code: string };
  batchTiming: { id: string; name: string; mode: string } | null;
  course: { id: string; title: string; code: string | null };
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  remarks: string | null;
}

@Injectable()
export class BranchAssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async getSheet(
    user: BranchAuthUser,
    input: { batchId: string; batchCourseId?: string; batchTimingId?: string },
  ) {
    if (input.batchTimingId) {
      return this.getTimingSheet(user, {
        batchId: input.batchId,
        batchTimingId: input.batchTimingId,
      });
    }

    if (!input.batchCourseId) {
      throw new BadRequestException(
        'Either batchTimingId or batchCourseId is required',
      );
    }

    const context = await this.resolveSessionContext(
      user,
      input.batchId,
      input.batchCourseId,
      { forWrite: false },
    );

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchStudentWhere(input.batchId, user.branchId),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      branch: context.branch,
      batch: context.batch,
      timing: null,
      session: context.session,
      course: context.session.course,
      students: enrollments.map((row) => ({
        id: row.student.id,
        firstName: row.student.firstName,
        lastName: row.student.lastName,
        studentCode: row.student.studentCode,
        name: this.personName(row.student.firstName, row.student.lastName),
      })),
      totalStudents: enrollments.length,
    };
  }

  private async getTimingSheet(
    user: BranchAuthUser,
    input: { batchId: string; batchTimingId: string },
  ) {
    const context = await this.resolveTimingContext(
      user,
      input.batchId,
      input.batchTimingId,
      { forWrite: false },
    );
    const effectiveBatchId = context.batch.id;

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchTimingActiveStudentWhere(
        effectiveBatchId,
        input.batchTimingId,
        user.branchId,
      ),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      branch: context.branch,
      batch: context.batch,
      timing: context.timing,
      session: context.session,
      course: context.session.course,
      students: enrollments.map((row) => ({
        id: row.student.id,
        firstName: row.student.firstName,
        lastName: row.student.lastName,
        studentCode: row.student.studentCode,
        name: this.personName(row.student.firstName, row.student.lastName),
      })),
      totalStudents: enrollments.length,
    };
  }

  async bulkCreate(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId?: string;
      batchTimingId?: string;
      type: AssessmentType;
      name: string;
      date: string;
      maxMarks: number;
      records: Array<{
        studentId: string;
        obtainedMarks: number;
        remarks?: string;
      }>;
    },
  ) {
    if (!input.records.length) {
      throw new BadRequestException(
        'At least one student mark is required to save an assessment',
      );
    }

    let batchCourseId = input.batchCourseId;
    let effectiveBatchId = input.batchId;
    if (input.batchTimingId) {
      const context = await this.resolveTimingContext(
        user,
        input.batchId,
        input.batchTimingId,
        { forWrite: true },
      );
      effectiveBatchId = context.batch.id;
      batchCourseId = batchCourseId ?? context.batchCourseId;
    }

    if (!batchCourseId) {
      throw new BadRequestException(
        'Either batchTimingId or batchCourseId is required',
      );
    }

    const context = await this.resolveSessionContext(
      user,
      effectiveBatchId,
      batchCourseId,
      { forWrite: true },
    );
    const date = this.parseDate(input.date);
    const maxMarks = input.maxMarks;
    this.assertMarks(maxMarks, maxMarks);

    const enrollmentWhere = input.batchTimingId
      ? facultyBatchTimingActiveStudentWhere(
          input.batchId,
          input.batchTimingId,
          user.branchId,
        )
      : facultyBatchStudentWhere(input.batchId, user.branchId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: enrollmentWhere,
      select: { studentId: true },
    });
    const enrolledIds = new Set(enrollments.map((row) => row.studentId));

    if (!enrolledIds.size) {
      throw new BadRequestException(
        'No enrolled students found for this batch',
      );
    }

    const seen = new Set<string>();
    for (const row of input.records) {
      if (seen.has(row.studentId)) {
        throw new BadRequestException(
          'Duplicate student in assessment payload',
        );
      }
      seen.add(row.studentId);

      if (!enrolledIds.has(row.studentId)) {
        throw new BadRequestException(
          'Student is not enrolled in the selected batch',
        );
      }

      this.assertMarks(maxMarks, row.obtainedMarks);
    }

    const assessmentGroupId = randomUUID();

    const saved = await this.prisma.$transaction(async (tx) => {
      const results: AssessmentRow[] = [];
      for (const row of input.records) {
        const record = await tx.academicAssessment.create({
          data: {
            branchId: user.branchId,
            batchId: context.batch.id,
            batchCourseId,
            assessmentGroupId,
            studentId: row.studentId,
            facultyId: user.sub,
            type: input.type,
            name: input.name.trim(),
            date,
            maxMarks,
            obtainedMarks: row.obtainedMarks,
            remarks: row.remarks,
            createdBy: user.sub,
            updatedBy: user.sub,
          },
          include: assessmentInclude,
        });
        results.push(record);
      }
      return results;
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_BULK_CREATED',
      resourceType: 'AcademicAssessment',
      resourceId: assessmentGroupId,
      metadata: {
        batchId: input.batchId,
        batchCourseId,
        type: input.type,
        name: input.name,
        count: saved.length,
      },
    });

    return this.getGroup(user, assessmentGroupId);
  }

  async getForEdit(user: BranchAuthUser, id: string) {
    const grouped = await this.prisma.academicAssessment.findMany({
      where: {
        assessmentGroupId: id,
        branchId: user.branchId,
      },
      include: assessmentInclude,
      orderBy: [{ student: { firstName: 'asc' } }, { createdAt: 'asc' }],
    });

    if (grouped.length) {
      return this.buildGroupDetail(user, grouped, id);
    }

    const record = await this.prisma.academicAssessment.findFirst({
      where: {
        id,
        branchId: user.branchId,
      },
      include: assessmentInclude,
    });

    if (!record) {
      throw new NotFoundException('Assessment not found');
    }

    return this.buildGroupDetail(
      user,
      [record],
      record.assessmentGroupId ?? record.id,
    );
  }

  async getGroup(user: BranchAuthUser, assessmentGroupId: string) {
    return this.getForEdit(user, assessmentGroupId);
  }

  private async buildGroupDetail(
    user: BranchAuthUser,
    records: AssessmentRow[],
    assessmentGroupId: string,
  ) {
    await this.access.assertFacultyCanAccessBatch(user, records[0].batchId);

    const first = records[0];
    const marks = records.map((row) => ({
      id: row.id,
      student: {
        id: row.student.id,
        name: this.personName(row.student.firstName, row.student.lastName),
        studentCode: row.student.studentCode,
      },
      obtainedMarks: Number(row.obtainedMarks),
      remarks: row.remarks,
    }));

    const summary = summarizeAssessmentMarks(
      records.map((row) => ({
        type: row.type,
        maxMarks: Number(row.maxMarks),
        obtainedMarks: Number(row.obtainedMarks),
      })),
    );

    const timing = await this.inferAssessmentTiming(
      first.batchId,
      user.branchId,
      records.map((row) => row.studentId),
    );

    return {
      assessmentGroupId,
      type: first.type,
      name: first.name,
      date: first.date,
      maxMarks: Number(first.maxMarks),
      batch: first.batch,
      timing,
      session: first.batchCourse
        ? toAttendanceSessionDto({
            batchCourseId: first.batchCourse.id,
            sessionId: first.batchCourse.session?.id,
            sessionNumber: first.batchCourse.session?.sessionNumber,
            courseId: first.batchCourse.course.id,
            courseTitle: first.batchCourse.course.title,
            courseCode: first.batchCourse.course.code,
          })
        : null,
      course: first.batchCourse
        ? {
            id: first.batchCourse.course.id,
            title: first.batchCourse.course.title,
            code: first.batchCourse.course.code,
          }
        : null,
      faculty: first.faculty
        ? {
            id: first.faculty.id,
            name: this.personName(first.faculty.firstName, first.faculty.lastName),
          }
        : null,
      marks,
      summary,
    };
  }

  async bulkUpdateGroup(
    user: BranchAuthUser,
    assessmentGroupId: string,
    input: {
      name?: string;
      type?: AssessmentType;
      date?: string;
      maxMarks?: number;
      records?: Array<{
        studentId: string;
        obtainedMarks: number;
        remarks?: string;
      }>;
      removeStudentIds?: string[];
    },
  ) {
    let existing = await this.prisma.academicAssessment.findMany({
      where: {
        assessmentGroupId,
        branchId: user.branchId,
      },
    });

    if (!existing.length) {
      const single = await this.prisma.academicAssessment.findFirst({
        where: {
          id: assessmentGroupId,
          branchId: user.branchId,
        },
      });
      if (single) {
        existing = [single];
      }
    }

    if (!existing.length) {
      throw new NotFoundException('Assessment not found');
    }

    const groupKey = existing[0].assessmentGroupId ?? existing[0].id;

    await this.access.assertFacultyCanAccessBatch(user, existing[0].batchId);

    if (this.access.isFaculty(user)) {
      const foreign = existing.some((row) => row.facultyId !== user.sub);
      if (foreign) {
        throw new BaseException(
          ERROR_CODES.PERMISSION_DENIED,
          'Faculty cannot edit another faculty assessment',
          403,
        );
      }
    }

    const maxMarks = input.maxMarks ?? Number(existing[0].maxMarks);
    const name = input.name?.trim() ?? existing[0].name;
    const type = input.type ?? existing[0].type;
    const date = input.date ? this.parseDate(input.date) : existing[0].date;
    this.assertMarks(maxMarks, maxMarks);

    const byStudent = new Map(existing.map((row) => [row.studentId, row]));
    const batchId = existing[0].batchId;
    const groupFilter: Prisma.AcademicAssessmentWhereInput =
      existing[0].assessmentGroupId != null
        ? { assessmentGroupId: groupKey, branchId: user.branchId }
        : { id: existing[0].id, branchId: user.branchId };

    if (input.records?.length) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: facultyBatchStudentWhere(batchId, user.branchId),
        select: { studentId: true },
      });
      const enrolledIds = new Set(enrollments.map((row) => row.studentId));

      for (const row of input.records) {
        if (!enrolledIds.has(row.studentId)) {
          throw new BadRequestException(
            'Student is not enrolled in the selected batch',
          );
        }
        this.assertMarks(maxMarks, row.obtainedMarks);
      }
    }

    await this.prisma.$transaction(async (tx) => {
      if (input.removeStudentIds?.length) {
        for (const studentId of input.removeStudentIds) {
          const row = byStudent.get(studentId);
          if (!row) continue;
          await tx.academicAssessment.delete({ where: { id: row.id } });
          byStudent.delete(studentId);
        }
      }

      if (input.records?.length) {
        for (const row of input.records) {
          const current = byStudent.get(row.studentId);
          if (current) {
            await tx.academicAssessment.update({
              where: { id: current.id },
              data: {
                name,
                type,
                date,
                maxMarks,
                obtainedMarks: row.obtainedMarks,
                remarks: row.remarks ?? current.remarks,
                updatedBy: user.sub,
              },
            });
          } else {
            const created = await tx.academicAssessment.create({
              data: {
                branchId: existing[0].branchId,
                batchId: existing[0].batchId,
                batchCourseId: existing[0].batchCourseId,
                assessmentGroupId: existing[0].assessmentGroupId ?? groupKey,
                studentId: row.studentId,
                facultyId: user.sub,
                type,
                name,
                date,
                maxMarks,
                obtainedMarks: row.obtainedMarks,
                remarks: row.remarks,
                createdBy: user.sub,
                updatedBy: user.sub,
              },
            });
            byStudent.set(row.studentId, created);
          }
        }
      }

      const remaining = await tx.academicAssessment.findMany({
        where: groupFilter,
      });

      if (!remaining.length) {
        throw new BadRequestException(
          'Assessment must include at least one student mark',
        );
      }

      if (input.name || input.maxMarks != null || input.type || input.date) {
        await tx.academicAssessment.updateMany({
          where: groupFilter,
          data: {
            ...(input.name ? { name } : {}),
            ...(input.maxMarks != null ? { maxMarks } : {}),
            ...(input.type ? { type } : {}),
            ...(input.date ? { date } : {}),
            updatedBy: user.sub,
          },
        });
      }
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_GROUP_UPDATED',
      resourceType: 'AcademicAssessment',
      resourceId: assessmentGroupId,
      metadata: { name, maxMarks },
    });

    return this.getForEdit(user, groupKey);
  }

  async create(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId?: string;
      studentId: string;
      type: AssessmentType;
      name: string;
      date: string;
      maxMarks: number;
      obtainedMarks: number;
      remarks?: string;
    },
  ) {
    this.assertMarks(input.maxMarks, input.obtainedMarks);
    await this.access.assertFacultyCanAccessBatch(user, input.batchId);
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    if (input.batchCourseId) {
      await this.resolveSessionContext(
        user,
        input.batchId,
        input.batchCourseId,
        { forWrite: true },
      );
    }

    const record = await this.prisma.academicAssessment.create({
      data: {
        branchId: user.branchId,
        batchId: input.batchId,
        batchCourseId: input.batchCourseId,
        assessmentGroupId: randomUUID(),
        studentId: input.studentId,
        facultyId: user.sub,
        type: input.type,
        name: input.name.trim(),
        date: this.parseDate(input.date),
        maxMarks: input.maxMarks,
        obtainedMarks: input.obtainedMarks,
        remarks: input.remarks,
        createdBy: user.sub,
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_CREATED',
      resourceType: 'AcademicAssessment',
      resourceId: record.id,
      metadata: {
        type: input.type,
        name: input.name,
        obtainedMarks: input.obtainedMarks,
        maxMarks: input.maxMarks,
      },
    });

    return this.findById(user, record.id);
  }

  async update(
    user: BranchAuthUser,
    id: string,
    input: {
      name?: string;
      date?: string;
      maxMarks?: number;
      obtainedMarks?: number;
      remarks?: string;
      type?: AssessmentType;
    },
  ) {
    const existing = await this.prisma.academicAssessment.findFirst({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Assessment not found');
    }

    if (existing.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    await this.access.assertFacultyCanAccessBatch(user, existing.batchId);

    if (this.access.isFaculty(user) && existing.facultyId !== user.sub) {
      throw new BaseException(
        ERROR_CODES.PERMISSION_DENIED,
        'Faculty cannot edit another faculty assessment',
        403,
      );
    }

    const maxMarks = input.maxMarks ?? Number(existing.maxMarks);
    const obtainedMarks =
      input.obtainedMarks ?? Number(existing.obtainedMarks);
    this.assertMarks(maxMarks, obtainedMarks);

    await this.prisma.academicAssessment.update({
      where: { id },
      data: {
        name: input.name?.trim() ?? existing.name,
        date: input.date ? this.parseDate(input.date) : existing.date,
        type: input.type ?? existing.type,
        maxMarks,
        obtainedMarks,
        remarks: input.remarks ?? existing.remarks,
        updatedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'ASSESSMENT_UPDATED',
      resourceType: 'AcademicAssessment',
      resourceId: id,
      metadata: { maxMarks, obtainedMarks },
    });

    return this.findById(user, id);
  }

  async list(user: BranchAuthUser, query: AssessmentListQuery) {
    const where = await this.buildWhere(user, query);

    const records = await this.prisma.academicAssessment.findMany({
      where,
      include: assessmentInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return records.map((row) => this.toDto(row));
  }

  async report(user: BranchAuthUser, query: AssessmentListQuery) {
    const where = await this.buildWhere(user, query);

    const records = await this.prisma.academicAssessment.findMany({
      where,
      include: assessmentInclude,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    const groups = this.groupAssessmentRecords(records);
    const skip = query.skip ?? 0;
    const take = query.take ?? groups.length;

    return {
      items: groups.slice(skip, skip + take),
      total: groups.length,
    };
  }

  async getBatchAnalytics(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const batch = await this.prisma.batch.findFirst({
      where: {
        id: batchId,
        branchId: user.branchId,
        isDeleted: false,
      },
      select: { id: true, name: true, code: true },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchStudentWhere(batchId, user.branchId),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const assessmentRows = await this.prisma.academicAssessment.findMany({
      where: {
        branchId: user.branchId,
        batchId,
      },
      select: {
        studentId: true,
        type: true,
        maxMarks: true,
        obtainedMarks: true,
        assessmentGroupId: true,
      },
    });

    const byStudent = new Map<
      string,
      Array<{
        type: AssessmentType;
        maxMarks: number;
        obtainedMarks: number;
        assessmentGroupId: string | null;
      }>
    >();

    for (const row of assessmentRows) {
      const list = byStudent.get(row.studentId) ?? [];
      list.push({
        type: row.type,
        maxMarks: Number(row.maxMarks),
        obtainedMarks: Number(row.obtainedMarks),
        assessmentGroupId: row.assessmentGroupId,
      });
      byStudent.set(row.studentId, list);
    }

    const students = enrollments.map((enrollment) => {
      const rows = byStudent.get(enrollment.student.id) ?? [];
      const uniqueGroups = new Set(
        rows
          .map((row) => row.assessmentGroupId)
          .filter((value): value is string => Boolean(value)),
      );
      const legacyCount = rows.filter((row) => !row.assessmentGroupId).length;
      const totalAssessments = uniqueGroups.size + legacyCount;
      const byType = averagePercentageByType(rows);
      const overall =
        rows.length > 0
          ? Math.round(
              (rows.reduce(
                (acc, row) =>
                  acc + assessmentPercentage(row.obtainedMarks, row.maxMarks),
                0,
              ) /
                rows.length) *
                10,
            ) / 10
          : null;

      return {
        student: {
          id: enrollment.student.id,
          name: this.personName(
            enrollment.student.firstName,
            enrollment.student.lastName,
          ),
          studentCode: enrollment.student.studentCode,
        },
        totalAssessments,
        byType,
        averagePercentage: overall,
      };
    });

    return { batch, students };
  }

  async getBatchTimingProgress(
    user: BranchAuthUser,
    batchId: string,
    batchTimingId: string,
    search?: string,
  ) {
    const context = await this.resolveTimingContext(
      user,
      batchId,
      batchTimingId,
      { forWrite: false },
    );
    const effectiveBatchId = context.batch.id;

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchTimingActiveStudentWhere(
        effectiveBatchId,
        batchTimingId,
        user.branchId,
      ),
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const studentIds = enrollments.map((row) => row.student.id);
    const assessmentRows =
      studentIds.length === 0
        ? []
        : await this.prisma.academicAssessment.findMany({
            where: {
              branchId: user.branchId,
              batchId: effectiveBatchId,
              studentId: { in: studentIds },
            },
            select: {
              studentId: true,
              type: true,
              maxMarks: true,
              obtainedMarks: true,
            },
          });

    const byStudent = new Map<
      string,
      Array<{
        type: AssessmentType;
        maxMarks: number;
        obtainedMarks: number;
      }>
    >();

    for (const row of assessmentRows) {
      const list = byStudent.get(row.studentId) ?? [];
      list.push({
        type: row.type,
        maxMarks: Number(row.maxMarks),
        obtainedMarks: Number(row.obtainedMarks),
      });
      byStudent.set(row.studentId, list);
    }

    const assessmentTypes = [...ASSESSMENT_TYPES];

    const normalizedSearch = search?.trim().toLowerCase() ?? '';

    const students = enrollments
      .map((enrollment) => {
        const rows = byStudent.get(enrollment.student.id) ?? [];
        const countsByType = countAssessmentsByType(rows);
        const overall =
          rows.length > 0
            ? Math.round(
                (rows.reduce(
                  (acc, row) =>
                    acc +
                    assessmentPercentage(row.obtainedMarks, row.maxMarks),
                  0,
                ) /
                  rows.length) *
                  10,
              ) / 10
            : null;

        return {
          student: {
            id: enrollment.student.id,
            name: this.personName(
              enrollment.student.firstName,
              enrollment.student.lastName,
            ),
            studentCode: enrollment.student.studentCode,
          },
          countsByType,
          totalAssessments: rows.length,
          overallPerformance: overall,
        };
      })
      .filter((row) => {
        if (!normalizedSearch) return true;
        return (
          row.student.name.toLowerCase().includes(normalizedSearch) ||
          row.student.studentCode.toLowerCase().includes(normalizedSearch)
        );
      });

    return {
      batch: context.batch,
      branch: context.branch,
      timing: context.timing,
      course: context.session.course,
      assessmentTypes,
      students,
    };
  }

  async getStudentTimingAssessmentDetail(
    user: BranchAuthUser,
    batchId: string,
    batchTimingId: string,
    studentId: string,
  ) {
    const context = await this.resolveTimingContext(
      user,
      batchId,
      batchTimingId,
      { forWrite: false },
    );
    const effectiveBatchId = context.batch.id;

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        ...facultyBatchTimingActiveStudentWhere(
          effectiveBatchId,
          batchTimingId,
          user.branchId,
        ),
        studentId,
      },
      include: enrollmentAssessmentInclude,
    });

    if (!enrollment) {
      throw new NotFoundException(
        'Student is not enrolled in this batch timing',
      );
    }

    return this.buildEnrollmentAssessmentDetail(enrollment, user.branchId, {
      batch: context.batch,
      branch: context.branch ?? {
        id: enrollment.branch.id,
        branchName: enrollment.branch.branchName,
        branchCode: enrollment.branch.branchCode,
      },
      timing: context.timing,
      course: context.session.course,
    });
  }

  /**
   * Student page → assessment records and reports (active/current enrollments only).
   */
  async getStudentAssessmentOverview(
    user: BranchAuthUser,
    studentId: string,
  ) {
    await this.access.assertFacultyCanAccessStudent(user, studentId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        ...facultyBranchEnrollmentWhere(user.branchId, { studentId }),
        status: { in: FACULTY_VISIBLE_ENROLLMENT_STATUSES },
      },
      include: enrollmentAssessmentInclude,
      orderBy: { createdAt: 'desc' },
    });

    const records: StudentAssessmentRecordDto[] = [];

    for (const enrollment of enrollments) {
      const assessmentRows = await this.prisma.academicAssessment.findMany({
        where: {
          branchId: user.branchId,
          batchId: enrollment.batchId,
          studentId,
        },
        include: assessmentInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      });

      for (const row of assessmentRows) {
        records.push(this.toStudentAssessmentRecord(row, enrollment));
      }
    }

    records.sort(
      (left, right) =>
        new Date(String(right.date)).getTime() -
        new Date(String(left.date)).getTime(),
    );

    const markRows = records.map((row) => ({
      type: row.type as AssessmentType,
      maxMarks: row.maxMarks,
      obtainedMarks: row.obtainedMarks,
    }));
    const summary = summarizeAssessmentMarks(markRows);
    const countsByType = countAssessmentsByType(markRows);

    return {
      studentId,
      records,
      assessmentTypes: listAssessmentTypesPresent(markRows),
      countsByType,
      totalAssessments: records.length,
      overallPerformance: summary.averagePercentage,
      summary,
    };
  }

  /**
   * Enrollment manage → assessment/progress (exact enrollment context).
   */
  async getEnrollmentAssessmentDetail(
    enrollmentId: string,
    branchId?: string,
  ) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        isDeleted: false,
        ...(branchId ? { branchId } : {}),
      },
      include: enrollmentAssessmentInclude,
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return this.buildEnrollmentAssessmentDetail(
      enrollment,
      enrollment.branchId,
      {
        batch: {
          id: enrollment.batch.id,
          name: enrollment.batch.name,
          code: enrollment.batch.code,
        },
        branch: {
          id: enrollment.branch.id,
          branchName: enrollment.branch.branchName,
          branchCode: enrollment.branch.branchCode,
        },
        timing: enrollment.batchTiming
          ? {
              id: enrollment.batchTiming.id,
              name: enrollment.batchTiming.name,
              mode: enrollment.batchTiming.mode,
            }
          : null,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          code: enrollment.course.code,
        },
      },
    );
  }

  async getEnrollmentAssessments(
    user: BranchAuthUser,
    enrollmentId: string,
  ) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        isDeleted: false,
        ...facultyBranchEnrollmentWhere(user.branchId),
      },
      include: enrollmentAssessmentInclude,
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.access.assertFacultyCanAccessBatch(user, enrollment.batchId);

    return this.buildEnrollmentAssessmentDetail(enrollment, user.branchId, {
      batch: {
        id: enrollment.batch.id,
        name: enrollment.batch.name,
        code: enrollment.batch.code,
      },
      branch: {
        id: enrollment.branch.id,
        branchName: enrollment.branch.branchName,
        branchCode: enrollment.branch.branchCode,
      },
      timing: enrollment.batchTiming
        ? {
            id: enrollment.batchTiming.id,
            name: enrollment.batchTiming.name,
            mode: enrollment.batchTiming.mode,
          }
        : null,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        code: enrollment.course.code,
      },
    });
  }

  async findById(user: BranchAuthUser, id: string) {
    const record = await this.prisma.academicAssessment.findFirst({
      where: { id },
      include: assessmentInclude,
    });

    if (!record) {
      throw new NotFoundException('Assessment not found');
    }

    if (record.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    await this.access.assertFacultyCanAccessBatch(user, record.batchId);

    return this.toDto(record);
  }

  private async buildWhere(
    user: BranchAuthUser,
    query: AssessmentListQuery,
  ): Promise<Prisma.AcademicAssessmentWhereInput> {
    const where: Prisma.AcademicAssessmentWhereInput = {
      branchId: user.branchId,
    };

    if (this.access.isFaculty(user)) {
      const batchIds = await this.access.visibleBatchIds(user);
      if (batchIds) {
        where.batchId = { in: batchIds };
      }
    }

    if (query.batchId) {
      await this.access.assertFacultyCanAccessBatch(user, query.batchId);
      where.batchId = query.batchId;
    }

    if (query.batchCourseId) {
      if (query.batchId) {
        await this.resolveSessionContext(
          user,
          query.batchId,
          query.batchCourseId,
          { forWrite: false },
        );
      }
      where.batchCourseId = query.batchCourseId;
    }

    if (query.studentId) {
      await this.access.assertFacultyCanAccessStudent(
        user,
        query.studentId,
        query.batchId,
      );
      where.studentId = query.studentId;
    }

    if (query.facultyId) {
      if (this.access.isFaculty(user) && query.facultyId !== user.sub) {
        throw new BaseException(
          ERROR_CODES.PERMISSION_DENIED,
          'Faculty cannot view another faculty assessments',
          403,
        );
      }
      where.facultyId = query.facultyId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.from || query.to) {
      where.date = {
        ...(query.from ? { gte: this.parseDate(query.from) } : {}),
        ...(query.to
          ? { lt: addUtcDays(this.parseDate(query.to), 1) }
          : {}),
      };
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        {
          student: {
            firstName: { contains: term, mode: 'insensitive' },
          },
        },
        {
          student: {
            lastName: { contains: term, mode: 'insensitive' },
          },
        },
        {
          student: {
            studentCode: { contains: term, mode: 'insensitive' },
          },
        },
        { name: { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async resolveSessionContext(
    user: BranchAuthUser,
    batchId: string,
    batchCourseId: string,
    options: { forWrite: boolean },
  ) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const assignment = await this.prisma.batchCourse.findFirst({
      where: {
        id: batchCourseId,
        isDeleted: false,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        session: { select: { id: true, sessionNumber: true } },
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
            branchId: true,
            status: true,
            startDate: true,
            endDate: true,
            isActive: true,
            isDeleted: true,
            branch: {
              select: { id: true, branchName: true, branchCode: true },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Session not found');
    }

    if (assignment.batchId !== batchId) {
      throw new BadRequestException(
        'Session does not belong to the selected batch',
      );
    }

    if (assignment.batch.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.BRANCH_ACCESS_DENIED,
        'Branch access denied',
        403,
      );
    }

    if (options.forWrite) {
      ensureBatchSelectableForAssignment({
        status: assignment.batch.status as BatchStatus,
        startDate: assignment.batch.startDate,
        endDate: assignment.batch.endDate,
        isActive: assignment.batch.isActive,
        isDeleted: assignment.batch.isDeleted,
      });
    }

    return {
      branch: assignment.batch.branch,
      batch: {
        id: assignment.batch.id,
        name: assignment.batch.name,
        code: assignment.batch.code,
      },
      session: toAttendanceSessionDto({
        batchCourseId: assignment.id,
        sessionId: assignment.session?.id,
        sessionNumber: assignment.session?.sessionNumber,
        courseId: assignment.course.id,
        courseTitle: assignment.course.title,
        courseCode: assignment.course.code,
      }),
    };
  }

  private async resolveTimingContext(
    user: BranchAuthUser,
    batchId: string,
    batchTimingId: string,
    options: { forWrite: boolean },
  ) {
    return resolveBranchBatchTimingContext(
      this.prisma,
      this.access,
      user,
      batchId,
      batchTimingId,
      options,
    );
  }

  private assertMarks(maxMarks: number, obtainedMarks: number) {
    if (maxMarks <= 0) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Maximum marks must be greater than zero',
        400,
      );
    }

    if (obtainedMarks < 0 || maxMarks < 0) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Marks cannot be negative',
        400,
      );
    }

    if (obtainedMarks > maxMarks) {
      throw new BaseException(
        ERROR_CODES.INVALID_MARKS,
        'Obtained marks cannot exceed maximum marks',
        400,
      );
    }
  }

  private parseDate(value: string): Date {
    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException('Invalid date');
    }
  }

  private personName(firstName: string, lastName?: string | null) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }

  private groupAssessmentRecords(records: AssessmentRow[]) {
    const map = new Map<string, AssessmentRow[]>();

    for (const row of records) {
      const key =
        row.assessmentGroupId ??
        `legacy:${row.id}:${row.type}:${row.name}:${row.date.toISOString()}:${row.maxMarks}`;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }

    return Array.from(map.values()).map((rows) => this.toReportGroupDto(rows));
  }

  private toReportGroupDto(rows: AssessmentRow[]) {
    const first = rows[0];
    const summary = summarizeAssessmentMarks(
      rows.map((row) => ({
        type: row.type,
        maxMarks: Number(row.maxMarks),
        obtainedMarks: Number(row.obtainedMarks),
      })),
    );

    return {
      id: first.assessmentGroupId ?? first.id,
      assessmentGroupId: first.assessmentGroupId,
      type: first.type,
      name: first.name,
      date: first.date,
      maxMarks: Number(first.maxMarks),
      batch: first.batch,
      course: first.batchCourse
        ? {
            id: first.batchCourse.course.id,
            title: first.batchCourse.course.title,
            code: first.batchCourse.course.code,
          }
        : null,
      session: first.batchCourse
        ? toAttendanceSessionDto({
            batchCourseId: first.batchCourse.id,
            sessionId: first.batchCourse.session?.id,
            sessionNumber: first.batchCourse.session?.sessionNumber,
            courseId: first.batchCourse.course.id,
            courseTitle: first.batchCourse.course.title,
            courseCode: first.batchCourse.course.code,
          })
        : null,
      faculty: first.faculty
        ? {
            id: first.faculty.id,
            name: this.personName(
              first.faculty.firstName,
              first.faculty.lastName,
            ),
          }
        : null,
      studentCount: rows.length,
      averageMarks: summary.averageMarks,
      averagePercentage: summary.averagePercentage,
      summary,
    };
  }

  private async inferAssessmentTiming(
    batchId: string,
    branchId: string,
    studentIds: string[],
  ) {
    if (!studentIds.length) {
      return null;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        batchId,
        branchId,
        studentId: { in: studentIds },
        batchTimingId: { not: null },
        status: { in: ['ADMITTED', 'ACTIVE'] },
      },
      select: {
        batchTimingId: true,
        batchTiming: {
          select: { id: true, name: true, mode: true },
        },
      },
    });

    const counts = new Map<
      string,
      { count: number; timing: { id: string; name: string; mode: string } }
    >();

    for (const enrollment of enrollments) {
      if (!enrollment.batchTimingId || !enrollment.batchTiming) {
        continue;
      }

      const current = counts.get(enrollment.batchTimingId) ?? {
        count: 0,
        timing: enrollment.batchTiming,
      };
      current.count += 1;
      counts.set(enrollment.batchTimingId, current);
    }

    let best: {
      count: number;
      timing: { id: string; name: string; mode: string };
    } | null = null;

    for (const value of counts.values()) {
      if (!best || value.count > best.count) {
        best = value;
      }
    }

    return best?.timing ?? null;
  }

  private async buildEnrollmentAssessmentDetail(
    enrollment: EnrollmentAssessmentRow,
    branchId: string,
    context: {
      batch: { id: string; name: string; code: string };
      branch: { id: string; branchName: string; branchCode: string };
      timing: { id: string; name: string; mode: string } | null;
      course: { id: string; title: string; code: string | null };
    },
  ) {
    const records = await this.prisma.academicAssessment.findMany({
      where: {
        branchId,
        batchId: enrollment.batchId,
        studentId: enrollment.studentId,
      },
      include: assessmentInclude,
      orderBy: [{ type: 'asc' }, { date: 'desc' }, { createdAt: 'desc' }],
    });

    const markRows = records.map((row) => ({
      type: row.type,
      maxMarks: Number(row.maxMarks),
      obtainedMarks: Number(row.obtainedMarks),
    }));

    const grouped = ASSESSMENT_TYPES.map((type) => ({
      type,
      items: records
        .filter((row) => row.type === type)
        .map((row) => this.toDto(row)),
    }));

    const summary = summarizeAssessmentMarks(markRows);
    const countsByType = countAssessmentsByType(markRows);

    return {
      student: {
        id: enrollment.student.id,
        name: this.personName(
          enrollment.student.firstName,
          enrollment.student.lastName,
        ),
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        studentCode: enrollment.student.studentCode,
        email: enrollment.student.email,
        phone: enrollment.student.phone,
        status: enrollment.student.status,
      },
      enrollmentId: enrollment.id,
      batch: context.batch,
      branch: context.branch,
      timing: context.timing,
      course: context.course,
      overallPerformance: summary.averagePercentage,
      totalAssessments: records.length,
      countsByType,
      assessmentTypes: listAssessmentTypesPresent(markRows),
      groupedAssessments: grouped,
      records: records.map((row) => this.toStudentAssessmentRecord(row, enrollment)),
      summary,
    };
  }

  private toStudentAssessmentRecord(
    row: AssessmentRow,
    enrollment: EnrollmentAssessmentRow,
  ): StudentAssessmentRecordDto {
    const maxMarks = Number(row.maxMarks);
    const obtainedMarks = Number(row.obtainedMarks);
    const courseFromAssessment = row.batchCourse?.course;

    return {
      id: row.id,
      assessmentGroupId: row.assessmentGroupId,
      enrollmentId: enrollment.id,
      date: row.date,
      name: row.name,
      type: row.type,
      batch: {
        id: enrollment.batch.id,
        name: enrollment.batch.name,
        code: enrollment.batch.code,
      },
      batchTiming: enrollment.batchTiming
        ? {
            id: enrollment.batchTiming.id,
            name: enrollment.batchTiming.name,
            mode: enrollment.batchTiming.mode,
          }
        : null,
      course: courseFromAssessment
        ? {
            id: courseFromAssessment.id,
            title: courseFromAssessment.title,
            code: courseFromAssessment.code,
          }
        : {
            id: enrollment.course.id,
            title: enrollment.course.title,
            code: enrollment.course.code,
          },
      maxMarks,
      obtainedMarks,
      percentage: assessmentPercentage(obtainedMarks, maxMarks),
      remarks: row.remarks,
    };
  }

  private toDto(row: AssessmentRow) {
    const maxMarks = Number(row.maxMarks);
    const obtainedMarks = Number(row.obtainedMarks);

    return {
      id: row.id,
      assessmentGroupId: row.assessmentGroupId,
      type: row.type,
      name: row.name,
      date: row.date,
      maxMarks,
      obtainedMarks,
      percentage: assessmentPercentage(obtainedMarks, maxMarks),
      remarks: row.remarks,
      student: {
        id: row.student.id,
        name: this.personName(row.student.firstName, row.student.lastName),
        studentCode: row.student.studentCode,
      },
      batch: row.batch,
      course: row.batchCourse
        ? {
            id: row.batchCourse.course.id,
            title: row.batchCourse.course.title,
            code: row.batchCourse.course.code,
          }
        : null,
      session: row.batchCourse
        ? toAttendanceSessionDto({
            batchCourseId: row.batchCourse.id,
            sessionId: row.batchCourse.session?.id,
            sessionNumber: row.batchCourse.session?.sessionNumber,
            courseId: row.batchCourse.course.id,
            courseTitle: row.batchCourse.course.title,
            courseCode: row.batchCourse.course.code,
          })
        : null,
      faculty: row.faculty
        ? {
            id: row.faculty.id,
            name: this.personName(row.faculty.firstName, row.faculty.lastName),
          }
        : null,
    };
  }
}
