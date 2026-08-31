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
  summarizeAssessmentMarks,
} from './assessment-analytics.util';
import {
  formatAttendanceSessionLabel,
  toAttendanceSessionDto,
} from './attendance-session.util';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { addUtcDays, parseDateOnly } from './date.util';
import { facultyBatchStudentWhere } from './faculty-batch-query';

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

@Injectable()
export class BranchAssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async getSheet(
    user: BranchAuthUser,
    input: { batchId: string; batchCourseId: string },
  ) {
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
      session: context.session,
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
      batchCourseId: string;
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

    const context = await this.resolveSessionContext(
      user,
      input.batchId,
      input.batchCourseId,
      { forWrite: true },
    );
    const date = this.parseDate(input.date);
    const maxMarks = input.maxMarks;
    this.assertMarks(maxMarks, maxMarks);

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchStudentWhere(input.batchId, user.branchId),
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
            batchCourseId: input.batchCourseId,
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
        batchCourseId: input.batchCourseId,
        type: input.type,
        name: input.name,
        count: saved.length,
      },
    });

    return this.getGroup(user, assessmentGroupId);
  }

  async getGroup(user: BranchAuthUser, assessmentGroupId: string) {
    const records = await this.prisma.academicAssessment.findMany({
      where: {
        assessmentGroupId,
        branchId: user.branchId,
      },
      include: assessmentInclude,
      orderBy: [{ student: { firstName: 'asc' } }, { createdAt: 'asc' }],
    });

    if (!records.length) {
      throw new NotFoundException('Assessment not found');
    }

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

    return {
      assessmentGroupId,
      type: first.type,
      name: first.name,
      date: first.date,
      maxMarks: Number(first.maxMarks),
      batch: first.batch,
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
      maxMarks?: number;
      records?: Array<{
        studentId: string;
        obtainedMarks: number;
        remarks?: string;
      }>;
      removeStudentIds?: string[];
    },
  ) {
    const existing = await this.prisma.academicAssessment.findMany({
      where: {
        assessmentGroupId,
        branchId: user.branchId,
      },
    });

    if (!existing.length) {
      throw new NotFoundException('Assessment not found');
    }

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
    this.assertMarks(maxMarks, maxMarks);

    const byStudent = new Map(existing.map((row) => [row.studentId, row]));
    const batchId = existing[0].batchId;

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
                assessmentGroupId,
                studentId: row.studentId,
                facultyId: user.sub,
                type: existing[0].type,
                name,
                date: existing[0].date,
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
        where: { assessmentGroupId, branchId: user.branchId },
      });

      if (!remaining.length) {
        throw new BadRequestException(
          'Assessment must include at least one student mark',
        );
      }

      if (input.name || input.maxMarks != null) {
        await tx.academicAssessment.updateMany({
          where: { assessmentGroupId, branchId: user.branchId },
          data: {
            ...(input.name ? { name } : {}),
            ...(input.maxMarks != null ? { maxMarks } : {}),
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

    return this.getGroup(user, assessmentGroupId);
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
    const skip = query.skip ?? 0;
    const take = query.take;

    const [records, total] = await Promise.all([
      this.prisma.academicAssessment.findMany({
        where,
        include: assessmentInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        ...(take != null ? { take } : {}),
      }),
      this.prisma.academicAssessment.count({ where }),
    ]);

    return {
      items: records.map((row) => this.toDto(row)),
      total,
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
