import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, CourseMode, EnrollmentStatus, Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import {
  ensureBatchSelectableForAssignment,
} from '@modules/batch/domain/utils/batch-selection.util';
import { BatchCalendarService } from '@modules/batch/application/batch-calendar/batch-calendar.service';
import {
  dateFromDateKey,
  dateKeyFromDate,
  todayDateKey,
} from '@modules/batch/application/batch-calendar/batch-calendar.util';
import { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import {
  addUtcDays,
  durationMinutes,
  getPeriodRange,
  parseDateOnly,
  startOfUtcDay,
} from './date.util';
import { formatBatchSessionCode } from '@modules/batch/domain/utils/batch-session.util';
import {
  formatAttendanceSessionLabel,
  toAttendanceSessionDto,
} from './attendance-session.util';
import {
  applyStatusCount,
  buildAttendanceAnalyticsStats,
  emptyStatusCounts,
  monthKeyFromDate,
  monthLabelFromKey,
  type AttendanceStatusCounts,
} from './attendance-analytics.util';
import { facultyBatchStudentWhere, facultyBatchTimingStudentWhere } from './faculty-batch-query';

const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export interface StudentBatchAttendanceQuery {
  from?: string;
  to?: string;
  batchCourseId?: string;
  courseId?: string;
  status?: AttendanceStatus;
}

export interface AttendanceReportQuery {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date?: string;
  from?: string;
  to?: string;
  batchId?: string;
  batchCourseId?: string;
  batchTimingId?: string;
  mode?: 'OFFLINE' | 'ONLINE' | 'RECORDED';
  requireBatchTiming?: boolean;
  courseId?: string;
  studentId?: string;
  facultyId?: string;
  status?: AttendanceStatus;
  search?: string;
  skip?: number;
  take?: number;
}

const MARK_STATUSES: AttendanceStatus[] = [
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.LATE,
];

const attendanceInclude = {
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
  batchTiming: {
    select: { id: true, name: true, mode: true },
  },
  branch: {
    select: { id: true, branchName: true, branchCode: true },
  },
} satisfies Prisma.AttendanceInclude;

type AttendanceRow = Prisma.AttendanceGetPayload<{
  include: typeof attendanceInclude;
}>;

@Injectable()
export class BranchAttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
    private readonly batchCalendar: BatchCalendarService,
  ) {}

  async listSessions(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const assignments = await this.prisma.batchCourse.findMany({
      where: {
        batchId,
        isDeleted: false,
        batch: { branchId: user.branchId, isDeleted: false },
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        session: { select: { id: true, sessionNumber: true } },
      },
      orderBy: [
        { session: { sessionNumber: 'asc' } },
        { createdAt: 'asc' },
      ],
    });

    return assignments.map((row) =>
      toAttendanceSessionDto({
        batchCourseId: row.id,
        sessionId: row.session?.id,
        sessionNumber: row.session?.sessionNumber,
        courseId: row.course.id,
        courseTitle: row.course.title,
        courseCode: row.course.code,
      }),
    );
  }

  async getSheet(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId?: string;
      batchTimingId?: string;
      date: string;
    },
  ) {
    if (input.batchTimingId) {
      return this.getTimingSheet(user, {
        batchId: input.batchId,
        batchTimingId: input.batchTimingId,
        date: input.date,
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
    const date = this.parseDate(input.date);

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

    const existing = await this.prisma.attendance.findMany({
      where: {
        branchId: user.branchId,
        batchId: input.batchId,
        batchCourseId: input.batchCourseId,
        batchTimingId: null,
        date,
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        remarks: true,
      },
    });
    const byStudent = new Map(existing.map((row) => [row.studentId, row]));

    const students = enrollments.map((enrollment) => {
      const record = byStudent.get(enrollment.student.id);
      return {
        id: enrollment.student.id,
        studentCode: enrollment.student.studentCode,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        name: [enrollment.student.firstName, enrollment.student.lastName]
          .filter(Boolean)
          .join(' '),
        enrollmentId: enrollment.id,
        attendanceId: record?.id ?? null,
        status: record?.status ?? null,
        remarks: record?.remarks ?? null,
      };
    });

    const summary = this.summarizeStatuses(
      students.map((student) => student.status),
    );

    return {
      date: input.date,
      branch: context.branch,
      batch: context.batch,
      session: context.session,
      students,
      summary,
      hasExisting: existing.length > 0,
    };
  }

  private async getTimingSheet(
    user: BranchAuthUser,
    input: { batchId: string; batchTimingId: string; date: string },
  ) {
    const context = await this.resolveTimingContext(
      user,
      input.batchId,
      input.batchTimingId,
      { forWrite: false },
    );
    const date = this.parseDate(input.date);

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchTimingStudentWhere(
        input.batchId,
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

    const existing = await this.prisma.attendance.findMany({
      where: {
        branchId: user.branchId,
        batchId: input.batchId,
        batchTimingId: input.batchTimingId,
        date,
      },
      select: {
        id: true,
        studentId: true,
        status: true,
        remarks: true,
      },
    });
    const byStudent = new Map(existing.map((row) => [row.studentId, row]));

    const students = enrollments.map((enrollment) => {
      const record = byStudent.get(enrollment.student.id);
      return {
        id: enrollment.student.id,
        studentCode: enrollment.student.studentCode,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        name: [enrollment.student.firstName, enrollment.student.lastName]
          .filter(Boolean)
          .join(' '),
        enrollmentId: enrollment.id,
        attendanceId: record?.id ?? null,
        status: record?.status ?? null,
        remarks: record?.remarks ?? null,
      };
    });

    const summary = this.summarizeStatuses(
      students.map((student) => student.status),
    );

    const calendar = await this.batchCalendar.getCalendarDayStatus(
      input.batchId,
      context.timing.mode,
      input.date,
    );

    return {
      date: input.date,
      branch: context.branch,
      batch: context.batch,
      timing: context.timing,
      session: context.session,
      students,
      summary,
      hasExisting: existing.length > 0,
      calendar,
    };
  }

  async upsertAttendance(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId?: string;
      batchTimingId?: string;
      studentId: string;
      date: string;
      status: AttendanceStatus;
      punchIn?: string;
      punchOut?: string;
      remarks?: string;
    },
  ) {
    if (input.batchTimingId) {
      return this.upsertTimingAttendance(user, input);
    }

    if (!input.batchCourseId) {
      throw new BadRequestException(
        'Either batchTimingId or batchCourseId is required',
      );
    }

    this.assertMarkStatus(input.status);
    const context = await this.resolveSessionContext(
      user,
      input.batchId,
      input.batchCourseId,
      { forWrite: true },
    );
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    const date = this.parseDate(input.date);
    const punchIn = input.punchIn ? new Date(input.punchIn) : undefined;
    const punchOut = input.punchOut ? new Date(input.punchOut) : undefined;

    if (punchIn && Number.isNaN(punchIn.getTime())) {
      throw new BadRequestException('Invalid punch in time');
    }

    if (punchOut && Number.isNaN(punchOut.getTime())) {
      throw new BadRequestException('Invalid punch out time');
    }

    if (punchIn && punchOut && punchOut < punchIn) {
      throw new BadRequestException('Punch out cannot be before punch in');
    }

    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_batchCourseId_date: {
          studentId: input.studentId,
          batchCourseId: input.batchCourseId,
          date,
        },
      },
    });

    const duration =
      punchIn && punchOut
        ? durationMinutes(punchIn, punchOut)
        : existing?.punchIn && punchOut
          ? durationMinutes(existing.punchIn, punchOut)
          : punchIn && existing?.punchOut
            ? durationMinutes(punchIn, existing.punchOut)
            : (existing?.durationMinutes ?? null);

    const record = existing
      ? await this.prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: input.status,
            facultyId: this.access.isFaculty(user)
              ? user.sub
              : existing.facultyId,
            punchIn: punchIn ?? existing.punchIn,
            punchOut: punchOut ?? existing.punchOut,
            durationMinutes: duration,
            remarks: input.remarks ?? existing.remarks,
            updatedBy: user.sub,
          },
          include: attendanceInclude,
        })
      : await this.prisma.attendance.create({
          data: {
            branchId: user.branchId,
            batchId: context.batch.id,
            batchCourseId: input.batchCourseId,
            studentId: input.studentId,
            facultyId: user.sub,
            date,
            status: input.status,
            punchIn,
            punchOut,
            durationMinutes: duration,
            remarks: input.remarks,
            createdBy: user.sub,
            updatedBy: user.sub,
          },
          include: attendanceInclude,
        });

    await this.access.log({
      user,
      action: existing ? 'ATTENDANCE_UPDATED' : 'ATTENDANCE_RECORDED',
      resourceType: 'Attendance',
      resourceId: record.id,
      metadata: {
        studentId: input.studentId,
        batchId: input.batchId,
        batchCourseId: input.batchCourseId,
        date: input.date,
        status: input.status,
      },
    });

    return this.toAttendanceDto(record);
  }

  private async upsertTimingAttendance(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchTimingId?: string;
      studentId: string;
      date: string;
      status: AttendanceStatus;
      punchIn?: string;
      punchOut?: string;
      remarks?: string;
    },
  ) {
    this.assertMarkStatus(input.status);
    const context = await this.resolveTimingContext(
      user,
      input.batchId,
      input.batchTimingId!,
      { forWrite: true },
    );

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        ...facultyBatchTimingStudentWhere(
          input.batchId,
          input.batchTimingId!,
          user.branchId,
        ),
        studentId: input.studentId,
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new BadRequestException(
        'Student is not enrolled in the selected batch timing',
      );
    }

    await this.assertCalendarAllowsAttendance(
      input.batchId,
      context.timing.mode,
      input.date,
    );

    const date = this.parseDate(input.date);
    const punchIn = input.punchIn ? new Date(input.punchIn) : undefined;
    const punchOut = input.punchOut ? new Date(input.punchOut) : undefined;

    if (punchIn && Number.isNaN(punchIn.getTime())) {
      throw new BadRequestException('Invalid punch in time');
    }

    if (punchOut && Number.isNaN(punchOut.getTime())) {
      throw new BadRequestException('Invalid punch out time');
    }

    if (punchIn && punchOut && punchOut < punchIn) {
      throw new BadRequestException('Punch out cannot be before punch in');
    }

    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_batchTimingId_date: {
          studentId: input.studentId,
          batchTimingId: input.batchTimingId!,
          date,
        },
      },
    });

    const duration =
      punchIn && punchOut
        ? durationMinutes(punchIn, punchOut)
        : existing?.punchIn && punchOut
          ? durationMinutes(existing.punchIn, punchOut)
          : punchIn && existing?.punchOut
            ? durationMinutes(punchIn, existing.punchOut)
            : (existing?.durationMinutes ?? null);

    const record = existing
      ? await this.prisma.attendance.update({
          where: { id: existing.id },
          data: {
            status: input.status,
            facultyId: this.access.isFaculty(user)
              ? user.sub
              : existing.facultyId,
            punchIn: punchIn ?? existing.punchIn,
            punchOut: punchOut ?? existing.punchOut,
            durationMinutes: duration,
            remarks: input.remarks ?? existing.remarks,
            updatedBy: user.sub,
          },
          include: attendanceInclude,
        })
      : await this.prisma.attendance.create({
          data: {
            branchId: user.branchId,
            batchId: context.batch.id,
            batchCourseId: context.batchCourseId,
            batchTimingId: input.batchTimingId!,
            studentId: input.studentId,
            facultyId: user.sub,
            date,
            status: input.status,
            punchIn,
            punchOut,
            durationMinutes: duration,
            remarks: input.remarks,
            createdBy: user.sub,
            updatedBy: user.sub,
          },
          include: attendanceInclude,
        });

    await this.access.log({
      user,
      action: existing ? 'ATTENDANCE_UPDATED' : 'ATTENDANCE_RECORDED',
      resourceType: 'Attendance',
      resourceId: record.id,
      metadata: {
        studentId: input.studentId,
        batchId: input.batchId,
        batchTimingId: input.batchTimingId,
        date: input.date,
        status: input.status,
      },
    });

    return this.toAttendanceDto(record);
  }

  async bulkUpsert(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId?: string;
      batchTimingId?: string;
      date: string;
      records: Array<{
        studentId: string;
        status: AttendanceStatus;
        remarks?: string;
      }>;
    },
  ) {
    if (!input.records.length) {
      throw new BadRequestException('At least one attendance record is required');
    }

    if (input.batchTimingId) {
      return this.bulkUpsertForTiming(user, input);
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
      { forWrite: true },
    );
    const date = this.parseDate(input.date);

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchStudentWhere(input.batchId, user.branchId),
      select: { studentId: true },
    });
    const enrolledIds = new Set(enrollments.map((row) => row.studentId));

    if (!enrolledIds.size) {
      throw new BadRequestException('No enrolled students found for this batch');
    }

    const seen = new Set<string>();
    for (const row of input.records) {
      this.assertMarkStatus(row.status);
      if (seen.has(row.studentId)) {
        throw new BadRequestException(
          'Duplicate student in attendance payload',
        );
      }
      seen.add(row.studentId);

      if (!enrolledIds.has(row.studentId)) {
        throw new BadRequestException(
          'Student is not enrolled in the selected batch',
        );
      }
    }

    for (const studentId of enrolledIds) {
      if (!seen.has(studentId)) {
        throw new BadRequestException(
          'Attendance status is required for every enrolled student',
        );
      }
    }

    const saved = await this.prisma.$transaction(async (tx) => {
      const results: AttendanceRow[] = [];
      for (const row of input.records) {
        const existing = await tx.attendance.findUnique({
          where: {
            studentId_batchCourseId_date: {
              studentId: row.studentId,
              batchCourseId: input.batchCourseId!,
              date,
            },
          },
        });

        const record = existing
          ? await tx.attendance.update({
              where: { id: existing.id },
              data: {
                status: row.status,
                facultyId: this.access.isFaculty(user)
                  ? user.sub
                  : existing.facultyId,
                remarks: row.remarks ?? existing.remarks,
                updatedBy: user.sub,
              },
              include: attendanceInclude,
            })
          : await tx.attendance.create({
              data: {
                branchId: user.branchId,
                batchId: context.batch.id,
                batchCourseId: input.batchCourseId!,
                studentId: row.studentId,
                facultyId: user.sub,
                date,
                status: row.status,
                remarks: row.remarks,
                createdBy: user.sub,
                updatedBy: user.sub,
              },
              include: attendanceInclude,
            });

        results.push(record);
      }
      return results;
    });

    await this.access.log({
      user,
      action: 'ATTENDANCE_BULK_SAVED',
      resourceType: 'Attendance',
      resourceId: input.batchCourseId!,
      metadata: {
        batchId: input.batchId,
        batchCourseId: input.batchCourseId,
        date: input.date,
        count: saved.length,
      },
    });

    const items = saved.map((row) => this.toAttendanceDto(row));
    return {
      items,
      summary: this.summarizeStatuses(items.map((item) => item.status)),
    };
  }

  private async bulkUpsertForTiming(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchTimingId?: string;
      date: string;
      records: Array<{
        studentId: string;
        status: AttendanceStatus;
        remarks?: string;
      }>;
    },
  ) {
    const context = await this.resolveTimingContext(
      user,
      input.batchId,
      input.batchTimingId!,
      { forWrite: true },
    );

    await this.assertCalendarAllowsAttendance(
      input.batchId,
      context.timing.mode,
      input.date,
    );

    const date = this.parseDate(input.date);

    const enrollments = await this.prisma.enrollment.findMany({
      where: facultyBatchTimingStudentWhere(
        input.batchId,
        input.batchTimingId!,
        user.branchId,
      ),
      select: { studentId: true },
    });
    const enrolledIds = new Set(enrollments.map((row) => row.studentId));

    if (!enrolledIds.size) {
      throw new BadRequestException(
        'No admitted students found for this batch timing',
      );
    }

    const seen = new Set<string>();
    for (const row of input.records) {
      this.assertMarkStatus(row.status);
      if (seen.has(row.studentId)) {
        throw new BadRequestException(
          'Duplicate student in attendance payload',
        );
      }
      seen.add(row.studentId);

      if (!enrolledIds.has(row.studentId)) {
        throw new BadRequestException(
          'Student is not enrolled in the selected batch timing',
        );
      }
    }

    for (const studentId of enrolledIds) {
      if (!seen.has(studentId)) {
        throw new BadRequestException(
          'Attendance status is required for every enrolled student',
        );
      }
    }

    const saved = await this.prisma.$transaction(async (tx) => {
      const results: AttendanceRow[] = [];
      for (const row of input.records) {
        const existing = await tx.attendance.findUnique({
          where: {
            studentId_batchTimingId_date: {
              studentId: row.studentId,
              batchTimingId: input.batchTimingId!,
              date,
            },
          },
        });

        const record = existing
          ? await tx.attendance.update({
              where: { id: existing.id },
              data: {
                status: row.status,
                facultyId: this.access.isFaculty(user)
                  ? user.sub
                  : existing.facultyId,
                remarks: row.remarks ?? existing.remarks,
                updatedBy: user.sub,
              },
              include: attendanceInclude,
            })
          : await tx.attendance.create({
              data: {
                branchId: user.branchId,
                batchId: context.batch.id,
                batchCourseId: context.batchCourseId,
                batchTimingId: input.batchTimingId!,
                studentId: row.studentId,
                facultyId: user.sub,
                date,
                status: row.status,
                remarks: row.remarks,
                createdBy: user.sub,
                updatedBy: user.sub,
              },
              include: attendanceInclude,
            });

        results.push(record);
      }
      return results;
    });

    await this.access.log({
      user,
      action: 'ATTENDANCE_BULK_SAVED',
      resourceType: 'Attendance',
      resourceId: input.batchTimingId!,
      metadata: {
        batchId: input.batchId,
        batchTimingId: input.batchTimingId,
        batchCourseId: context.batchCourseId,
        date: input.date,
        count: saved.length,
      },
    });

    const items = saved.map((row) => this.toAttendanceDto(row));
    return {
      items,
      summary: this.summarizeStatuses(items.map((item) => item.status)),
    };
  }

  async punch(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId: string;
      studentId: string;
      type: 'IN' | 'OUT';
      date?: string;
    },
  ) {
    await this.resolveSessionContext(
      user,
      input.batchId,
      input.batchCourseId,
      { forWrite: true },
    );
    await this.access.assertFacultyCanAccessStudent(
      user,
      input.studentId,
      input.batchId,
    );

    const date = input.date
      ? this.parseDate(input.date)
      : startOfUtcDay(new Date());
    const now = new Date();

    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_batchCourseId_date: {
          studentId: input.studentId,
          batchCourseId: input.batchCourseId,
          date,
        },
      },
    });

    if (input.type === 'IN') {
      if (existing?.punchIn) {
        throw new BadRequestException('Student already punched in today');
      }

      return this.upsertAttendance(user, {
        batchId: input.batchId,
        batchCourseId: input.batchCourseId,
        studentId: input.studentId,
        date: date.toISOString().slice(0, 10),
        status: AttendanceStatus.PRESENT,
        punchIn: now.toISOString(),
        punchOut: existing?.punchOut?.toISOString(),
      });
    }

    if (!existing?.punchIn) {
      throw new BadRequestException('Student has not punched in today');
    }

    if (existing.punchOut) {
      throw new BadRequestException('Student already punched out today');
    }

    return this.upsertAttendance(user, {
      batchId: input.batchId,
      batchCourseId: input.batchCourseId,
      studentId: input.studentId,
      date: date.toISOString().slice(0, 10),
      status: existing.status,
      punchOut: now.toISOString(),
    });
  }

  async list(user: BranchAuthUser, query: AttendanceReportQuery) {
    const where = await this.buildWhere(user, query);
    const skip = query.skip ?? 0;
    const take = query.take;

    const [records, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: attendanceInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        ...(take != null ? { take } : {}),
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      items: records.map((row) => this.toAttendanceDto(row)),
      total,
    };
  }

  async report(user: BranchAuthUser, query: AttendanceReportQuery) {
    const where = await this.buildWhere(user, query);
    const skip = query.skip ?? 0;
    const take = query.take;

    const [records, total, statusGroups] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: attendanceInclude,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        skip,
        ...(take != null ? { take } : {}),
      }),
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    const items = records.map((row) => this.toAttendanceDto(row));

    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      total,
      percentage: 0,
    };

    for (const group of statusGroups) {
      const count = group._count._all;
      if (group.status === AttendanceStatus.PRESENT) totals.present = count;
      if (group.status === AttendanceStatus.ABSENT) totals.absent = count;
      if (group.status === AttendanceStatus.LATE) totals.late = count;
      if (group.status === AttendanceStatus.LEAVE) totals.leave = count;
    }

    const counted = totals.total;
    const attended = totals.present + totals.late;
    totals.percentage =
      counted > 0 ? Math.round((attended / counted) * 1000) / 10 : 0;

    const sessionGroups = await this.prisma.attendance.groupBy({
      by: ['batchCourseId', 'status'],
      where,
      _count: { _all: true },
    });

    const sessionMeta = sessionGroups.length
      ? await this.prisma.batchCourse.findMany({
          where: {
            id: {
              in: Array.from(
                new Set(sessionGroups.map((row) => row.batchCourseId)),
              ),
            },
          },
          include: {
            course: { select: { title: true } },
            session: { select: { sessionNumber: true } },
          },
        })
      : [];
    const metaById = new Map(sessionMeta.map((row) => [row.id, row]));

    const bySessionMap = new Map<
      string,
      {
        batchCourseId: string;
        label: string;
        courseTitle: string;
        present: number;
        absent: number;
        late: number;
        leave: number;
        total: number;
      }
    >();

    for (const group of sessionGroups) {
      const meta = metaById.get(group.batchCourseId);
      const courseTitle = meta?.course.title ?? 'Course';
      const current = bySessionMap.get(group.batchCourseId) ?? {
        batchCourseId: group.batchCourseId,
        label: formatAttendanceSessionLabel(
          meta?.session?.sessionNumber,
          courseTitle,
        ),
        courseTitle,
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
      current.total += group._count._all;
      if (group.status === AttendanceStatus.PRESENT) {
        current.present += group._count._all;
      }
      if (group.status === AttendanceStatus.ABSENT) {
        current.absent += group._count._all;
      }
      if (group.status === AttendanceStatus.LATE) {
        current.late += group._count._all;
      }
      if (group.status === AttendanceStatus.LEAVE) {
        current.leave += group._count._all;
      }
      bySessionMap.set(group.batchCourseId, current);
    }

    return {
      totals,
      bySession: Array.from(bySessionMap.values()),
      items,
      total,
    };
  }

  /**
   * Batch Manage → Attendance overview + per-student analytics.
   * Conducted sessions = distinct (date, batchCourseId) with any attendance row.
   * Attended = Present + Late (existing domain rule).
   */
  async getBatchAttendanceAnalytics(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false, branchId: user.branchId },
      select: {
        id: true,
        name: true,
        code: true,
        startDate: true,
        endDate: true,
        daysOfWeek: true,
        branch: {
          select: { id: true, branchName: true, branchCode: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const [enrollments, conductedGroups, statusGroups, lastAttendanceRows] =
      await Promise.all([
        this.prisma.enrollment.findMany({
          where: facultyBatchStudentWhere(batchId, user.branchId),
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                studentCode: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.attendance.groupBy({
          by: ['date', 'batchCourseId'],
          where: {
            batchId,
            branchId: user.branchId,
          },
        }),
        this.prisma.attendance.groupBy({
          by: ['studentId', 'status'],
          where: {
            batchId,
            branchId: user.branchId,
          },
          _count: { _all: true },
        }),
        this.prisma.attendance.findMany({
          where: {
            batchId,
            branchId: user.branchId,
          },
          orderBy: [{ date: 'desc' }, { updatedAt: 'desc' }],
          select: {
            studentId: true,
            date: true,
            status: true,
          },
        }),
      ]);

    const conductedSessions = conductedGroups.length;
    const workingDays = this.countWorkingDays(
      batch.startDate,
      batch.endDate,
      batch.daysOfWeek,
    );

    const countsByStudent = new Map<string, AttendanceStatusCounts>();
    for (const group of statusGroups) {
      const current =
        countsByStudent.get(group.studentId) ?? emptyStatusCounts();
      applyStatusCount(current, group.status, group._count._all);
      countsByStudent.set(group.studentId, current);
    }

    const lastByStudent = new Map<
      string,
      { date: Date; status: AttendanceStatus }
    >();
    for (const row of lastAttendanceRows) {
      if (!lastByStudent.has(row.studentId)) {
        lastByStudent.set(row.studentId, {
          date: row.date,
          status: row.status,
        });
      }
    }

    let batchPresent = 0;
    let batchAbsent = 0;
    let batchLate = 0;
    let batchLeave = 0;
    let totalRecords = 0;
    const percentageSamples: number[] = [];

    const students = enrollments.map((enrollment) => {
      const counts =
        countsByStudent.get(enrollment.student.id) ?? emptyStatusCounts();
      const stats = buildAttendanceAnalyticsStats(counts, conductedSessions);
      batchPresent += counts.present;
      batchAbsent += counts.absent;
      batchLate += counts.late;
      batchLeave += counts.leave;
      totalRecords += counts.total;
      if (stats.percentage != null) {
        percentageSamples.push(stats.percentage);
      }

      const last = lastByStudent.get(enrollment.student.id);
      const name = [enrollment.student.firstName, enrollment.student.lastName]
        .filter(Boolean)
        .join(' ');

      return {
        id: enrollment.student.id,
        enrollmentId: enrollment.id,
        name,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        studentCode: enrollment.student.studentCode,
        status: enrollment.student.status,
        enrollmentStatus: enrollment.status,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        leave: stats.leave,
        totalRecords: stats.total,
        attended: stats.attended,
        conductedSessions: stats.conductedSessions,
        ratioLabel: stats.ratioLabel,
        percentage: stats.percentage,
        hasAttendance: stats.hasAttendance,
        lastAttendanceDate: last?.date ?? null,
        lastAttendanceStatus: last?.status ?? null,
      };
    });

    const averageAttendance =
      percentageSamples.length > 0
        ? Math.round(
            (percentageSamples.reduce((sum, value) => sum + value, 0) /
              percentageSamples.length) *
              10,
          ) / 10
        : null;

    return {
      batch: {
        id: batch.id,
        name: batch.name,
        code: batch.code,
      },
      branch: batch.branch,
      overview: {
        workingDays,
        sessionsConducted: conductedSessions,
        enrolledStudents: students.length,
        totalAttendanceRecords: totalRecords,
        present: batchPresent,
        absent: batchAbsent,
        late: batchLate,
        leave: batchLeave,
        averageAttendance,
      },
      students,
    };
  }

  /**
   * Attendance module → Batch Overview tab.
   * Aggregates by batch timing using ADMITTED enrollments and timing-scoped records.
   */
  async getBatchTimingAttendanceOverview(
    user: BranchAuthUser,
    batchId: string,
  ) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false, branchId: user.branchId },
      select: {
        id: true,
        name: true,
        code: true,
        startDate: true,
        endDate: true,
        branch: {
          select: { id: true, branchName: true, branchCode: true },
        },
        timings: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            mode: true,
          },
          orderBy: [{ mode: 'asc' }, { name: 'asc' }],
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const timingIds = batch.timings.map((timing) => timing.id);
    if (!timingIds.length) {
      return {
        batch: { id: batch.id, name: batch.name, code: batch.code },
        branch: batch.branch,
        modes: [],
      };
    }

    const statsRange = this.resolveStatsDateRange({
      enrollmentStartKey: dateKeyFromDate(batch.startDate),
      batchStartDate: batch.startDate,
      batchEndDate: batch.endDate,
    });

    const [enrollmentGroups, attendanceRows] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['batchTimingId'],
        where: {
          batchId,
          batchTimingId: { in: timingIds },
          isDeleted: false,
          status: EnrollmentStatus.ADMITTED,
          student: { isDeleted: false },
          batch: { branchId: user.branchId, isDeleted: false },
        },
        _count: { _all: true },
      }),
      this.prisma.attendance.findMany({
        where: {
          batchId,
          branchId: user.branchId,
          batchTimingId: { in: timingIds },
        },
        select: {
          batchTimingId: true,
          date: true,
          status: true,
        },
      }),
    ]);

    const enrolledByTiming = new Map<string, number>();
    for (const group of enrollmentGroups) {
      if (group.batchTimingId) {
        enrolledByTiming.set(group.batchTimingId, group._count._all);
      }
    }

    const workingDaysByTiming = new Map<string, Set<string>>();
    await Promise.all(
      batch.timings.map(async (timing) => {
        const dateKeys = await this.listApplicableWorkingDayKeys({
          batchId,
          mode: timing.mode,
          from: statsRange.from,
          to: statsRange.to,
          enrollmentStartKey: statsRange.from,
        });
        workingDaysByTiming.set(timing.id, new Set(dateKeys));
      }),
    );

    const countsByTiming = new Map<string, AttendanceStatusCounts>();
    for (const row of attendanceRows) {
      if (!row.batchTimingId) continue;
      const workingSet = workingDaysByTiming.get(row.batchTimingId);
      if (!workingSet) continue;
      const dateKey = row.date.toISOString().slice(0, 10);
      if (!workingSet.has(dateKey)) continue;
      const current =
        countsByTiming.get(row.batchTimingId) ?? emptyStatusCounts();
      applyStatusCount(current, row.status);
      countsByTiming.set(row.batchTimingId, current);
    }

    const modeOrder = ['OFFLINE', 'ONLINE', 'RECORDED'] as const;
    const modes = (
      await Promise.all(
        modeOrder.map(async (mode) => ({
          mode,
          timings: await Promise.all(
            batch.timings
              .filter((timing) => timing.mode === mode)
              .map(async (timing) => {
                const workingSet = workingDaysByTiming.get(timing.id);
                const counts =
                  countsByTiming.get(timing.id) ?? emptyStatusCounts();
                const sessionsConducted = workingSet?.size ?? 0;
                const stats = buildAttendanceAnalyticsStats(
                  counts,
                  sessionsConducted,
                );
                return {
                  id: timing.id,
                  name: timing.name,
                  mode: timing.mode,
                  enrolledStudents: enrolledByTiming.get(timing.id) ?? 0,
                  sessionsConducted: stats.conductedSessions,
                  present: stats.present,
                  absent: stats.absent,
                  late: stats.late,
                  totalRecords: stats.total,
                  percentage: stats.percentage ?? 0,
                };
              }),
          ),
        })),
      )
    ).filter((section) => section.timings.length > 0);

    return {
      batch: { id: batch.id, name: batch.name, code: batch.code },
      branch: batch.branch,
      modes,
    };
  }

  /**
   * Attendance module → Batch Overview drill-down for one timing.
   */
  async getBatchTimingStudentAttendance(
    user: BranchAuthUser,
    batchId: string,
    batchTimingId: string,
  ) {
    const context = await this.resolveTimingContext(user, batchId, batchTimingId, {
      forWrite: false,
    });

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false },
      select: { startDate: true, endDate: true },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const statsRange = this.resolveStatsDateRange({
      enrollmentStartKey: dateKeyFromDate(batch.startDate),
      batchStartDate: batch.startDate,
      batchEndDate: batch.endDate,
    });

    const modeWorkingDays = await this.listApplicableWorkingDayKeys({
      batchId,
      mode: context.timing.mode,
      from: statsRange.from,
      to: statsRange.to,
      enrollmentStartKey: statsRange.from,
    });

    const [enrollments, attendanceRows, lastAttendanceRows] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: facultyBatchTimingStudentWhere(
          batchId,
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
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.attendance.findMany({
        where: {
          batchId,
          batchTimingId,
          branchId: user.branchId,
        },
        select: {
          studentId: true,
          date: true,
          status: true,
        },
      }),
      this.prisma.attendance.findMany({
        where: {
          batchId,
          batchTimingId,
          branchId: user.branchId,
        },
        orderBy: [{ date: 'desc' }, { updatedAt: 'desc' }],
        select: {
          studentId: true,
          date: true,
          status: true,
        },
      }),
    ]);

    const lastByStudent = new Map<
      string,
      { date: Date; status: AttendanceStatus }
    >();
    for (const row of lastAttendanceRows) {
      if (!lastByStudent.has(row.studentId)) {
        lastByStudent.set(row.studentId, {
          date: row.date,
          status: row.status,
        });
      }
    }

    const students = enrollments.map((enrollment) => {
      const enrollmentStartKey = this.enrollmentDateKey(enrollment);
      const applicableWorkingDays = modeWorkingDays.filter(
        (dateKey) => dateKey >= enrollmentStartKey,
      );
      const applicableWorkingSet = new Set(applicableWorkingDays);

      const counts = emptyStatusCounts();
      for (const row of attendanceRows) {
        if (row.studentId !== enrollment.student.id) continue;
        const dateKey = row.date.toISOString().slice(0, 10);
        if (!applicableWorkingSet.has(dateKey)) continue;
        applyStatusCount(counts, row.status);
      }

      const stats = buildAttendanceAnalyticsStats(
        counts,
        applicableWorkingDays.length,
      );
      const name = [enrollment.student.firstName, enrollment.student.lastName]
        .filter(Boolean)
        .join(' ');
      const last = lastByStudent.get(enrollment.student.id);

      return {
        id: enrollment.student.id,
        enrollmentId: enrollment.id,
        name,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        studentCode: enrollment.student.studentCode,
        status: enrollment.student.status,
        enrollmentStatus: enrollment.status,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        leave: stats.leave,
        totalRecords: stats.total,
        percentage: stats.percentage ?? 0,
        conductedSessions: stats.conductedSessions,
        hasAttendance: stats.hasAttendance,
        lastAttendanceDate: last?.date ?? null,
        lastAttendanceStatus: last?.status ?? null,
      };
    });

    return { students };
  }

  /**
   * Batch Manage → student Manage attendance (scoped to branch + batch + student).
   */
  async getStudentBatchAttendanceDetail(
    user: BranchAuthUser,
    batchId: string,
    studentId: string,
    query: StudentBatchAttendanceQuery = {},
  ) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);
    await this.access.assertFacultyCanAccessStudent(user, studentId, batchId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        ...facultyBatchStudentWhere(batchId, user.branchId),
        studentId,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
            status: true,
            email: true,
            phone: true,
          },
        },
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
            startDate: true,
            endDate: true,
            daysOfWeek: true,
            branch: {
              select: { id: true, branchName: true, branchCode: true },
            },
          },
        },
        batchTiming: {
          select: { id: true, name: true, mode: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Student is not enrolled in this batch');
    }

    const sessionFilter: Prisma.AttendanceWhereInput = {
      batchId,
      branchId: user.branchId,
      ...(enrollment.batchTimingId
        ? { batchTimingId: enrollment.batchTimingId }
        : {}),
      ...(query.batchCourseId ? { batchCourseId: query.batchCourseId } : {}),
      ...(query.courseId
        ? { batchCourse: { courseId: query.courseId, isDeleted: false } }
        : {}),
    };

    const [allStudentRows, assignments] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          ...sessionFilter,
          studentId,
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          batchTiming: {
            select: { id: true, name: true, mode: true },
          },
          batchCourse: {
            select: {
              id: true,
              course: { select: { id: true, title: true, code: true } },
              session: { select: { id: true, sessionNumber: true } },
            },
          },
          faculty: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.batchCourse.findMany({
        where: {
          batchId,
          isDeleted: false,
          batch: { branchId: user.branchId, isDeleted: false },
        },
        include: {
          course: { select: { id: true, title: true, code: true } },
          session: { select: { id: true, sessionNumber: true } },
        },
        orderBy: [
          { session: { sessionNumber: 'asc' } },
          { createdAt: 'asc' },
        ],
      }),
    ]);

    const enrollmentStartKey = this.enrollmentDateKey(enrollment);
    const enrollmentMode = enrollment.batchTiming?.mode ?? null;
    const statsRange = this.resolveStatsDateRange({
      queryFrom: query.from,
      queryTo: query.to,
      enrollmentStartKey,
      batchStartDate: enrollment.batch.startDate,
      batchEndDate: enrollment.batch.endDate,
    });

    let applicableWorkingDays: string[] = [];
    let calendarSummary = {
      workingDays: 0,
      sundays: 0,
      holidays: 0,
      nonWorkingDays: 0,
      totalCalendarDays: 0,
    };

    if (enrollmentMode != null) {
      const batchPeriodSummary = await this.batchCalendar.getModeCalendarSummary(
        batchId,
        enrollmentMode,
      );
      calendarSummary = {
        workingDays: batchPeriodSummary.workingDays,
        sundays: batchPeriodSummary.sundays,
        holidays: batchPeriodSummary.holidays,
        nonWorkingDays: batchPeriodSummary.nonWorkingDays,
        totalCalendarDays: batchPeriodSummary.totalCalendarDays,
      };

      applicableWorkingDays = await this.listApplicableWorkingDayKeys({
        batchId,
        mode: enrollmentMode,
        from: statsRange.from,
        to: statsRange.to,
        enrollmentStartKey: statsRange.from,
        includeFuture: false,
      });
    }

    const applicableWorkingSet = new Set(applicableWorkingDays);

    const historyRows = allStudentRows.filter((row) => {
      const dateKey = dateKeyFromDate(row.date);
      if (query.from && dateKey < query.from.slice(0, 10)) return false;
      if (query.to && dateKey > query.to.slice(0, 10)) return false;
      if (query.status != null && row.status !== query.status) return false;
      return true;
    });

    const attendanceStats = this.buildSessionSummaryFromRows(allStudentRows);

    const statusByWorkingDate = new Map<string, AttendanceStatus>();
    for (const row of allStudentRows) {
      const dateKey = dateKeyFromDate(row.date);
      if (!applicableWorkingSet.has(dateKey)) continue;
      if (!statusByWorkingDate.has(dateKey)) {
        statusByWorkingDate.set(dateKey, row.status);
      }
    }

    const history = historyRows.map((row) => {
      const courseTitle = row.batchCourse.course.title;
      const sessionNumber = row.batchCourse.session?.sessionNumber ?? null;
      return {
        id: row.id,
        date: row.date,
        status: row.status,
        remarks: row.remarks,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        markedAt: row.updatedAt ?? row.createdAt,
        batchTiming: row.batchTiming
          ? {
              id: row.batchTiming.id,
              name: row.batchTiming.name,
              mode: row.batchTiming.mode,
            }
          : enrollment.batchTiming
            ? {
                id: enrollment.batchTiming.id,
                name: enrollment.batchTiming.name,
                mode: enrollment.batchTiming.mode,
              }
            : null,
        course: {
          id: row.batchCourse.course.id,
          title: courseTitle,
          code: row.batchCourse.course.code,
        },
        session: {
          batchCourseId: row.batchCourse.id,
          sessionId: row.batchCourse.session?.id ?? null,
          sessionNumber,
          label: formatAttendanceSessionLabel(sessionNumber, courseTitle),
        },
        faculty: row.faculty
          ? {
              id: row.faculty.id,
              name: [row.faculty.firstName, row.faculty.lastName]
                .filter(Boolean)
                .join(' '),
            }
          : null,
      };
    });

    const workingDaysByMonth = new Map<string, number>();
    for (const dateKey of applicableWorkingDays) {
      const key = monthKeyFromDate(dateFromDateKey(dateKey));
      workingDaysByMonth.set(key, (workingDaysByMonth.get(key) ?? 0) + 1);
    }

    const countsByMonth = new Map<string, AttendanceStatusCounts>();
    for (const [dateKey, status] of statusByWorkingDate.entries()) {
      const key = monthKeyFromDate(dateFromDateKey(dateKey));
      const current = countsByMonth.get(key) ?? emptyStatusCounts();
      applyStatusCount(current, status);
      countsByMonth.set(key, current);
    }

    const monthKeys = Array.from(
      new Set([...workingDaysByMonth.keys(), ...countsByMonth.keys()]),
    ).sort((a, b) => b.localeCompare(a));

    const monthly = monthKeys.map((key) => {
      const monthCounts = countsByMonth.get(key) ?? emptyStatusCounts();
      const monthConducted = workingDaysByMonth.get(key) ?? 0;
      const monthStats = buildAttendanceAnalyticsStats(
        monthCounts,
        monthConducted,
      );
      return {
        monthKey: key,
        label: monthLabelFromKey(key),
        present: monthStats.present,
        absent: monthStats.absent,
        late: monthStats.late,
        leave: monthStats.leave,
        conductedSessions: monthStats.conductedSessions,
        attended: monthStats.attended,
        percentage: monthStats.percentage,
        ratioLabel: monthStats.ratioLabel,
        hasAttendance: monthStats.hasAttendance,
      };
    });

    const studentName = [
      enrollment.student.firstName,
      enrollment.student.lastName,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      student: {
        id: enrollment.student.id,
        name: studentName,
        firstName: enrollment.student.firstName,
        lastName: enrollment.student.lastName,
        studentCode: enrollment.student.studentCode,
        status: enrollment.student.status,
        email: enrollment.student.email,
        phone: enrollment.student.phone,
      },
      batch: {
        id: enrollment.batch.id,
        name: enrollment.batch.name,
        code: enrollment.batch.code,
        startDate: enrollment.batch.startDate,
        endDate: enrollment.batch.endDate,
        daysOfWeek: enrollment.batch.daysOfWeek,
      },
      branch: enrollment.batch.branch,
      enrollmentId: enrollment.id,
      enrollmentStatus: enrollment.status,
      batchTiming: enrollment.batchTiming
        ? {
            id: enrollment.batchTiming.id,
            name: enrollment.batchTiming.name,
            mode: enrollment.batchTiming.mode,
          }
        : null,
      courses: assignments.map((row) =>
        toAttendanceSessionDto({
          batchCourseId: row.id,
          sessionId: row.session?.id,
          sessionNumber: row.session?.sessionNumber,
          courseId: row.course.id,
          courseTitle: row.course.title,
          courseCode: row.course.code,
        }),
      ),
      summary: {
        calendar: calendarSummary,
        attendance: {
          totalSessions: attendanceStats.conductedSessions,
          attended: attendanceStats.attended,
          present: attendanceStats.present,
          absent: attendanceStats.absent,
          late: attendanceStats.late,
          percentage: attendanceStats.percentage,
          ratioLabel: attendanceStats.ratioLabel,
        },
      },
      monthly,
      history,
    };
  }

  private buildSessionSummaryFromRows(
    rows: Array<{ date: Date; status: AttendanceStatus }>,
  ) {
    const statusBySessionDate = new Map<string, AttendanceStatus>();
    for (const row of rows) {
      if (
        row.status !== AttendanceStatus.PRESENT &&
        row.status !== AttendanceStatus.ABSENT &&
        row.status !== AttendanceStatus.LATE
      ) {
        continue;
      }
      const dateKey = dateKeyFromDate(row.date);
      if (!statusBySessionDate.has(dateKey)) {
        statusBySessionDate.set(dateKey, row.status);
      }
    }

    const sessionCounts = emptyStatusCounts();
    for (const status of statusBySessionDate.values()) {
      applyStatusCount(sessionCounts, status);
    }

    return buildAttendanceAnalyticsStats(
      sessionCounts,
      statusBySessionDate.size,
    );
  }

  private buildDateFilter(
    from?: string,
    to?: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    const filter: Prisma.DateTimeFilter = {};
    if (from) filter.gte = parseDateOnly(from);
    if (to) filter.lte = parseDateOnly(to);
    return filter;
  }

  private enrollmentDateKey(enrollment: {
    admissionDate: Date | null;
    joiningDate: Date | null;
    createdAt: Date;
  }): string {
    const source =
      enrollment.admissionDate ??
      enrollment.joiningDate ??
      enrollment.createdAt;
    return dateKeyFromDate(source);
  }

  private resolveStatsDateRange(params: {
    queryFrom?: string;
    queryTo?: string;
    enrollmentStartKey: string;
    batchStartDate: Date;
    batchEndDate: Date | null;
  }): { from: string; to: string } {
    const todayKey = todayDateKey();
    const batchStartKey = dateKeyFromDate(params.batchStartDate);
    const batchEndKey = params.batchEndDate
      ? dateKeyFromDate(params.batchEndDate)
      : todayKey;
    const upperBound = batchEndKey < todayKey ? batchEndKey : todayKey;
    const applicableStartKey =
      params.enrollmentStartKey > batchStartKey
        ? params.enrollmentStartKey
        : batchStartKey;

    if (params.queryFrom && params.queryTo) {
      const queryFrom = params.queryFrom.slice(0, 10);
      const queryTo = params.queryTo.slice(0, 10);
      const from =
        queryFrom > applicableStartKey ? queryFrom : applicableStartKey;
      const cappedTo = queryTo > upperBound ? upperBound : queryTo;
      if (cappedTo < from) {
        return { from, to: from };
      }
      return { from, to: cappedTo };
    }

    if (upperBound < applicableStartKey) {
      return { from: applicableStartKey, to: applicableStartKey };
    }
    return { from: applicableStartKey, to: upperBound };
  }

  private async listApplicableWorkingDayKeys(params: {
    batchId: string;
    mode: CourseMode;
    from: string;
    to: string;
    enrollmentStartKey: string;
    includeFuture?: boolean;
  }): Promise<string[]> {
    const { dateKeys } = await this.batchCalendar.listWorkingDays(
      params.batchId,
      params.mode,
      params.from,
      params.to,
      params.includeFuture ?? false,
    );
    return dateKeys.filter((dateKey) => dateKey >= params.enrollmentStartKey);
  }

  private async assertCalendarAllowsAttendance(
    batchId: string,
    mode: CourseMode,
    date: string,
  ): Promise<void> {
    const status = await this.batchCalendar.getCalendarDayStatus(
      batchId,
      mode,
      date,
    );
    if (!status.isAttendanceAllowed) {
      throw new BadRequestException(
        status.blockMessage ?? 'Attendance is not available for this date.',
      );
    }
  }

  private countWorkingDays(
    start: Date,
    end: Date | null,
    daysOfWeek: string[],
  ): number | null {
    if (!end || !daysOfWeek.length) return null;
    const allowed = new Set(
      daysOfWeek.map((day) => DAY_INDEX[day]).filter((v) => v !== undefined),
    );
    if (!allowed.size) return null;

    let count = 0;
    const cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const last = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );

    while (cursor.getTime() <= last.getTime()) {
      if (allowed.has(cursor.getUTCDay())) {
        count += 1;
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return count;
  }

  private async resolveTimingContext(
    user: BranchAuthUser,
    batchId: string,
    batchTimingId: string,
    options: { forWrite: boolean },
  ) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: batchTimingId,
        batchId,
        isDeleted: false,
      },
      include: {
        batch: {
          select: {
            id: true,
            name: true,
            code: true,
            branchId: true,
            courseId: true,
            status: true,
            startDate: true,
            endDate: true,
            isActive: true,
            isDeleted: true,
            branch: {
              select: { id: true, branchName: true, branchCode: true },
            },
            course: {
              select: { id: true, title: true, code: true },
            },
          },
        },
      },
    });

    if (!timing) {
      throw new NotFoundException('Batch timing not found for this batch');
    }

    if (timing.batch.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.PERMISSION_DENIED,
        'Branch access denied',
        403,
      );
    }

    if (options.forWrite) {
      ensureBatchSelectableForAssignment({
        status: timing.batch.status as BatchStatus,
        startDate: timing.batch.startDate,
        endDate: timing.batch.endDate,
        isActive: timing.batch.isActive,
        isDeleted: timing.batch.isDeleted,
      });
    }

    const courseId = timing.batch.course?.id ?? timing.batch.courseId;
    if (!courseId) {
      throw new NotFoundException('Batch course not found for this batch timing');
    }

    const assignment = await this.prisma.batchCourse.findFirst({
      where: {
        batchId,
        courseId,
        isDeleted: false,
      },
      include: {
        course: { select: { id: true, title: true, code: true } },
        session: { select: { id: true, sessionNumber: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        'Course assignment not found for this batch timing',
      );
    }

    return {
      batch: {
        id: timing.batch.id,
        name: timing.batch.name,
        code: timing.batch.code,
      },
      branch: timing.batch.branch,
      timing: {
        id: timing.id,
        name: timing.name,
        mode: timing.mode,
      },
      batchCourseId: assignment.id,
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
      throw new NotFoundException('Session not found for this batch');
    }

    if (assignment.batchId !== batchId) {
      throw new BadRequestException(
        'Selected session does not belong to the selected batch',
      );
    }

    if (assignment.batch.branchId !== user.branchId) {
      throw new BaseException(
        ERROR_CODES.PERMISSION_DENIED,
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
      batch: {
        id: assignment.batch.id,
        name: assignment.batch.name,
        code: assignment.batch.code,
      },
      branch: assignment.batch.branch,
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

  private async buildWhere(
    user: BranchAuthUser,
    query: AttendanceReportQuery,
  ): Promise<Prisma.AttendanceWhereInput> {
    const where: Prisma.AttendanceWhereInput = {
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
      } else {
        const assignment = await this.prisma.batchCourse.findFirst({
          where: {
            id: query.batchCourseId,
            isDeleted: false,
            batch: { branchId: user.branchId, isDeleted: false },
          },
          select: { id: true, batchId: true },
        });
        if (!assignment) {
          throw new NotFoundException('Session not found');
        }
        await this.access.assertFacultyCanAccessBatch(
          user,
          assignment.batchId,
        );
      }
      where.batchCourseId = query.batchCourseId;
    }

    if (query.batchTimingId) {
      if (query.batchId) {
        await this.resolveTimingContext(
          user,
          query.batchId,
          query.batchTimingId,
          { forWrite: false },
        );
      } else {
        const timing = await this.prisma.batchTiming.findFirst({
          where: {
            id: query.batchTimingId,
            isDeleted: false,
            batch: { branchId: user.branchId, isDeleted: false },
          },
          select: { id: true, batchId: true },
        });
        if (!timing) {
          throw new NotFoundException('Batch timing not found');
        }
        await this.access.assertFacultyCanAccessBatch(user, timing.batchId);
      }
      where.batchTimingId = query.batchTimingId;
    } else if (query.mode) {
      where.batchTiming = {
        is: {
          mode: query.mode,
          isDeleted: false,
          ...(query.batchId ? { batchId: query.batchId } : {}),
        },
      };
    } else if (query.requireBatchTiming) {
      where.batchTimingId = { not: null };
    }

    if (query.courseId) {
      where.batchCourse = {
        courseId: query.courseId,
      };
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
          'Faculty cannot view another faculty member attendance',
          403,
        );
      }
      where.facultyId = query.facultyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.student = {
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { studentCode: { contains: term, mode: 'insensitive' } },
        ],
      };
    }

    if (query.from || query.to) {
      const from = query.from ? this.parseDate(query.from) : undefined;
      const to = query.to
        ? addUtcDays(this.parseDate(query.to), 1)
        : undefined;
      where.date = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lt: to } : {}),
      };
    } else if (query.period || query.date) {
      const period = query.period ?? 'daily';
      const reference = query.date
        ? this.parseDate(query.date)
        : startOfUtcDay(new Date());
      const range = getPeriodRange(period, reference);
      where.date = { gte: range.from, lt: range.to };
    }

    return where;
  }

  private assertMarkStatus(status: AttendanceStatus) {
    if (!MARK_STATUSES.includes(status) && status !== AttendanceStatus.LEAVE) {
      throw new BadRequestException('Invalid attendance status');
    }
  }

  private summarizeStatuses(
    statuses: Array<AttendanceStatus | string | null | undefined>,
  ) {
    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      leave: 0,
      unmarked: 0,
      total: statuses.length,
      percentage: 0,
    };

    for (const status of statuses) {
      if (status === AttendanceStatus.PRESENT || status === 'PRESENT') {
        totals.present += 1;
      } else if (status === AttendanceStatus.ABSENT || status === 'ABSENT') {
        totals.absent += 1;
      } else if (status === AttendanceStatus.LATE || status === 'LATE') {
        totals.late += 1;
      } else if (status === AttendanceStatus.LEAVE || status === 'LEAVE') {
        totals.leave += 1;
      } else {
        totals.unmarked += 1;
      }
    }

    const attended = totals.present;
    const counted = totals.total;
    totals.percentage =
      counted > 0 ? Math.round((attended / counted) * 1000) / 10 : 0;

    return totals;
  }

  private parseDate(value: string): Date {
    try {
      return parseDateOnly(value);
    } catch {
      throw new BadRequestException('Invalid date');
    }
  }

  private toAttendanceDto(row: AttendanceRow) {
    const sessionNumber = row.batchCourse.session?.sessionNumber ?? null;
    const courseTitle = row.batchCourse.course.title;

    return {
      id: row.id,
      date: row.date,
      status: row.status,
      punchIn: row.punchIn,
      punchOut: row.punchOut,
      durationMinutes: row.durationMinutes,
      remarks: row.remarks,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      markedAt: row.updatedAt ?? row.createdAt,
      student: {
        id: row.student.id,
        name: [row.student.firstName, row.student.lastName]
          .filter(Boolean)
          .join(' '),
        studentCode: row.student.studentCode,
      },
      batch: row.batch,
      branch: row.branch,
      course: {
        id: row.batchCourse.course.id,
        title: courseTitle,
        code: row.batchCourse.course.code,
      },
      session: {
        batchCourseId: row.batchCourse.id,
        sessionId: row.batchCourse.session?.id ?? null,
        sessionNumber,
        sessionCode:
          sessionNumber != null
            ? formatBatchSessionCode(sessionNumber)
            : null,
        label: formatAttendanceSessionLabel(sessionNumber, courseTitle),
      },
      batchTiming: row.batchTiming
        ? {
            id: row.batchTiming.id,
            name: row.batchTiming.name,
            mode: row.batchTiming.mode,
          }
        : null,
      faculty: row.faculty
        ? {
            id: row.faculty.id,
            name: [row.faculty.firstName, row.faculty.lastName]
              .filter(Boolean)
              .join(' '),
          }
        : null,
    };
  }
}
