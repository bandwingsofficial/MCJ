import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus, Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import {
  ensureBatchSelectableForAssignment,
} from '@modules/batch/domain/utils/batch-selection.util';
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
import { facultyBatchStudentWhere } from './faculty-batch-query';

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
    input: { batchId: string; batchCourseId: string; date: string },
  ) {
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

  async upsertAttendance(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId: string;
      studentId: string;
      date: string;
      status: AttendanceStatus;
      punchIn?: string;
      punchOut?: string;
      remarks?: string;
    },
  ) {
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

  async bulkUpsert(
    user: BranchAuthUser,
    input: {
      batchId: string;
      batchCourseId: string;
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
              batchCourseId: input.batchCourseId,
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
                batchCourseId: input.batchCourseId,
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
      resourceId: input.batchCourseId,
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
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Student is not enrolled in this batch');
    }

    const dateFilter = this.buildDateFilter(query.from, query.to);
    const sessionFilter: Prisma.AttendanceWhereInput = {
      batchId,
      branchId: user.branchId,
      ...(dateFilter ? { date: dateFilter } : {}),
      ...(query.batchCourseId ? { batchCourseId: query.batchCourseId } : {}),
      ...(query.courseId
        ? { batchCourse: { courseId: query.courseId, isDeleted: false } }
        : {}),
    };

    const [conductedGroups, allStudentRows, assignments] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['date', 'batchCourseId'],
        where: sessionFilter,
      }),
      this.prisma.attendance.findMany({
        where: {
          ...sessionFilter,
          studentId,
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
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

    const conductedSessions = conductedGroups.length;
    const historyRows =
      query.status != null
        ? allStudentRows.filter((row) => row.status === query.status)
        : allStudentRows;

    const counts = emptyStatusCounts();
    for (const row of historyRows) {
      applyStatusCount(counts, row.status);
    }
    const stats = buildAttendanceAnalyticsStats(counts, conductedSessions);

    const attendanceDateKeys = new Set(
      historyRows.map((row) => row.date.toISOString().slice(0, 10)),
    );

    const workingDaysRangeStart =
      (dateFilter?.gte as Date | undefined) ?? enrollment.batch.startDate;
    const workingDaysRangeEnd =
      (dateFilter?.lte as Date | undefined) ??
      enrollment.batch.endDate ??
      new Date();
    const workingDays = this.countWorkingDays(
      workingDaysRangeStart,
      workingDaysRangeEnd,
      enrollment.batch.daysOfWeek ?? [],
    );

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

    const conductedByMonth = new Map<string, Set<string>>();
    for (const group of conductedGroups) {
      const key = monthKeyFromDate(group.date);
      const set = conductedByMonth.get(key) ?? new Set<string>();
      set.add(`${group.date.toISOString().slice(0, 10)}:${group.batchCourseId}`);
      conductedByMonth.set(key, set);
    }

    const countsByMonth = new Map<string, AttendanceStatusCounts>();
    for (const row of historyRows) {
      const key = monthKeyFromDate(row.date);
      const current = countsByMonth.get(key) ?? emptyStatusCounts();
      applyStatusCount(current, row.status);
      countsByMonth.set(key, current);
    }

    const monthKeys = Array.from(
      new Set([...conductedByMonth.keys(), ...countsByMonth.keys()]),
    ).sort((a, b) => b.localeCompare(a));

    const monthly = monthKeys.map((key) => {
      const monthCounts = countsByMonth.get(key) ?? emptyStatusCounts();
      const monthConducted = conductedByMonth.get(key)?.size ?? 0;
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
        workingDays,
        attendanceDates: attendanceDateKeys.size,
        sessionsConducted: stats.conductedSessions,
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        leave: stats.leave,
        attended: stats.attended,
        percentage: stats.percentage,
        ratioLabel: stats.ratioLabel,
        hasAttendance: stats.hasAttendance,
        totalRecords: stats.total,
      },
      monthly,
      history,
    };
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
