import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  AssessmentType,
  AttendanceStatus,
  DayOfWeek,
  EnrollmentStatus,
  Prisma,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  applyStatusCount,
  buildAttendanceAnalyticsStats,
  emptyStatusCounts,
} from './attendance-analytics.util';
import {
  assessmentPercentage,
  summarizeAssessmentMarks,
} from './assessment-analytics.util';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import {
  addUtcDays,
  getPeriodRange,
  parseDateOnly,
  startOfUtcDay,
  toDateOnlyString,
} from './date.util';
import { formatAttendanceSessionLabel } from './attendance-session.util';

const UTC_DAY_TO_DOW: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

const ASSESSMENT_TYPES = Object.values(AssessmentType);

export interface FacultyDashboardQuery {
  from?: string;
  to?: string;
  batchId?: string;
  batchCourseId?: string;
  assessmentType?: AssessmentType;
}

@Injectable()
export class FacultyDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async getDashboard(user: BranchAuthUser, query: FacultyDashboardQuery) {
    const batchWhere = await this.access.branchBatchWhere(user);
    const visibleBatches = await this.prisma.batch.findMany({
      where: {
        ...batchWhere,
        ...(query.batchId ? { id: query.batchId } : {}),
      },
      select: {
        id: true,
        name: true,
        code: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
        course: { select: { id: true, title: true } },
        batchCourses: {
          where: { isDeleted: false },
          select: {
            id: true,
            course: { select: { id: true, title: true } },
            session: { select: { id: true, sessionNumber: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (query.batchId) {
      await this.access.assertFacultyCanAccessBatch(user, query.batchId);
    }

    const batchIds = visibleBatches.map((batch) => batch.id);
    const today = startOfUtcDay(new Date());
    const tomorrow = addUtcDays(today, 1);
    const analyticsRange = this.resolveAnalyticsRange(query.from, query.to);

    const enrollmentWhere: Prisma.EnrollmentWhereInput = {
      isDeleted: false,
      status: {
        in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
      },
      batchId: batchIds.length ? { in: batchIds } : { in: [] },
    };

    const activeStudents = batchIds.length
      ? (
          await this.prisma.enrollment.findMany({
            where: enrollmentWhere,
            select: { studentId: true },
            distinct: ['studentId'],
          })
        ).length
      : 0;

    const expectedPairs = batchIds.length
      ? await this.prisma.enrollment.findMany({
          where: enrollmentWhere,
          select: { studentId: true, batchId: true },
        })
      : [];

    const todayAttendanceWhere: Prisma.AttendanceWhereInput = {
      branchId: user.branchId,
      batchId: batchIds.length ? { in: batchIds } : { in: [] },
      date: today,
      ...(query.batchCourseId
        ? { batchCourseId: query.batchCourseId }
        : {}),
    };

    const todayAttendance = batchIds.length
      ? await this.prisma.attendance.findMany({
          where: todayAttendanceWhere,
          select: { studentId: true, batchId: true, status: true },
        })
      : [];

    const recordedKeys = new Set(
      todayAttendance.map((row) => `${row.batchId}:${row.studentId}`),
    );
    const pendingAttendance = expectedPairs.filter(
      (row) => !recordedKeys.has(`${row.batchId}:${row.studentId}`),
    ).length;

    const todaysExpected = expectedPairs.length;
    const todaysMarked = recordedKeys.size;
    const todaysMarkedPercent =
      todaysExpected > 0
        ? Math.round((todaysMarked / todaysExpected) * 1000) / 10
        : 0;

    const last30DaysStart = addUtcDays(today, -30);

    const periodAttendanceWhere: Prisma.AttendanceWhereInput = {
      branchId: user.branchId,
      batchId: batchIds.length ? { in: batchIds } : { in: [] },
      date: {
        gte: analyticsRange.from,
        lt: analyticsRange.to,
      },
      ...(query.batchCourseId
        ? { batchCourseId: query.batchCourseId }
        : {}),
    };

    const [periodStatusGroups, periodDateGroups] = batchIds.length
      ? await Promise.all([
          this.prisma.attendance.groupBy({
            by: ['status'],
            where: periodAttendanceWhere,
            _count: { _all: true },
          }),
          this.prisma.attendance.groupBy({
            by: ['date', 'status'],
            where: periodAttendanceWhere,
            _count: { _all: true },
          }),
        ])
      : [[], []];

    const periodCounts = emptyStatusCounts();
    for (const group of periodStatusGroups) {
      applyStatusCount(periodCounts, group.status, group._count._all);
    }
    const attended = periodCounts.present + periodCounts.late;
    const attendanceSummary = {
      present: periodCounts.present,
      absent: periodCounts.absent,
      late: periodCounts.late,
      leave: periodCounts.leave,
      total: periodCounts.total,
      percentage:
        periodCounts.total > 0
          ? Math.round((attended / periodCounts.total) * 1000) / 10
          : 0,
    };

    const trendMap = new Map<
      string,
      { present: number; absent: number; late: number }
    >();
    for (const group of periodDateGroups) {
      const key = toDateOnlyString(group.date);
      const current = trendMap.get(key) ?? {
        present: 0,
        absent: 0,
        late: 0,
      };
      if (group.status === AttendanceStatus.PRESENT) {
        current.present += group._count._all;
      } else if (group.status === AttendanceStatus.ABSENT) {
        current.absent += group._count._all;
      } else if (group.status === AttendanceStatus.LATE) {
        current.late += group._count._all;
      }
      trendMap.set(key, current);
    }

    const attendanceTrend = this.buildTrendSeries(
      analyticsRange.from,
      analyticsRange.to,
      trendMap,
    );

    const assessmentWhere: Prisma.AcademicAssessmentWhereInput = {
      branchId: user.branchId,
      batchId: batchIds.length ? { in: batchIds } : { in: [] },
      date: {
        gte: analyticsRange.from,
        lt: analyticsRange.to,
      },
      ...(query.batchCourseId
        ? { batchCourseId: query.batchCourseId }
        : {}),
      ...(query.assessmentType ? { type: query.assessmentType } : {}),
    };

    const upcomingAssessmentWhere: Prisma.AcademicAssessmentWhereInput = {
      branchId: user.branchId,
      batchId: batchIds.length ? { in: batchIds } : { in: [] },
      date: { gte: today, lt: addUtcDays(today, 14) },
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.batchCourseId
        ? { batchCourseId: query.batchCourseId }
        : {}),
      ...(query.assessmentType ? { type: query.assessmentType } : {}),
    };

    const [
      periodAssessments,
      upcomingAssessments,
      recentAssessments,
      recentAssessmentsCount,
      activityLogs,
      recentAttendanceEvents,
    ] = batchIds.length
      ? await Promise.all([
          this.prisma.academicAssessment.findMany({
            where: assessmentWhere,
            select: {
              studentId: true,
              type: true,
              batchId: true,
              maxMarks: true,
              obtainedMarks: true,
              batch: { select: { name: true } },
            },
          }),
          this.prisma.academicAssessment.findMany({
            where: upcomingAssessmentWhere,
            orderBy: [{ date: 'asc' }, { name: 'asc' }],
            take: 8,
            include: {
              batch: { select: { id: true, name: true } },
              batchCourse: {
                include: {
                  course: { select: { title: true } },
                  session: { select: { sessionNumber: true } },
                },
              },
            },
          }),
          this.prisma.academicAssessment.findMany({
            where: {
              branchId: user.branchId,
              batchId: { in: batchIds },
            },
            orderBy: { createdAt: 'desc' },
            take: 8,
            include: {
              student: {
                select: { firstName: true, lastName: true, studentCode: true },
              },
              batch: { select: { name: true } },
            },
          }),
          this.prisma.academicAssessment.count({
            where: {
              branchId: user.branchId,
              batchId: { in: batchIds },
              createdAt: { gte: last30DaysStart },
              ...(query.batchCourseId
                ? { batchCourseId: query.batchCourseId }
                : {}),
              ...(query.assessmentType ? { type: query.assessmentType } : {}),
            },
          }),
          this.prisma.branchActivityLog.findMany({
            where: {
              branchId: user.branchId,
              actorId: user.sub,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          }),
          this.prisma.attendance.findMany({
            where: {
              branchId: user.branchId,
              batchId: { in: batchIds },
              OR: [{ facultyId: user.sub }, { createdBy: user.sub }],
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
            include: {
              student: {
                select: { firstName: true, lastName: true, studentCode: true },
              },
              batch: { select: { name: true } },
              batchCourse: {
                include: {
                  course: { select: { title: true } },
                  session: { select: { sessionNumber: true } },
                },
              },
            },
          }),
        ])
      : [[], [], [], 0, [], []];

    const assessmentSummary = summarizeAssessmentMarks(
      periodAssessments.map((row) => ({
        type: row.type,
        maxMarks: Number(row.maxMarks),
        obtainedMarks: Number(row.obtainedMarks),
      })),
    );

    const studentsAssessed = new Set(
      periodAssessments.map((row) => row.studentId),
    ).size;

    const byType = ASSESSMENT_TYPES.map((type) => {
      const typed = periodAssessments.filter((row) => row.type === type);
      if (!typed.length) {
        return { type, count: 0, averagePercentage: null as number | null };
      }
      const avg =
        typed.reduce(
          (acc, row) =>
            acc +
            assessmentPercentage(
              Number(row.obtainedMarks),
              Number(row.maxMarks),
            ),
          0,
        ) / typed.length;
      return {
        type,
        count: typed.length,
        averagePercentage: Math.round(avg * 10) / 10,
      };
    });

    const byBatchTypeMap = new Map<
      string,
      {
        type: AssessmentType;
        batchId: string;
        batchName: string;
        percentages: number[];
        studentIds: Set<string>;
      }
    >();
    for (const row of periodAssessments) {
      const key = `${row.batchId}:${row.type}`;
      const current = byBatchTypeMap.get(key) ?? {
        type: row.type,
        batchId: row.batchId,
        batchName: row.batch.name,
        percentages: [],
        studentIds: new Set<string>(),
      };
      current.percentages.push(
        assessmentPercentage(
          Number(row.obtainedMarks),
          Number(row.maxMarks),
        ),
      );
      current.studentIds.add(row.studentId);
      byBatchTypeMap.set(key, current);
    }
    const byBatchType = Array.from(byBatchTypeMap.values())
      .map((item) => ({
        type: item.type,
        batchId: item.batchId,
        batchName: item.batchName,
        averagePercentage:
          item.percentages.length > 0
            ? Math.round(
                (item.percentages.reduce((acc, value) => acc + value, 0) /
                  item.percentages.length) *
                  10,
              ) / 10
            : null,
        studentCount: item.studentIds.size,
      }))
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 8);

    const batchOverview = await this.buildBatchOverview(
      visibleBatches,
      user,
      today,
      expectedPairs,
      todayAttendance,
      periodAttendanceWhere,
    );

    const upcomingSessions = this.buildUpcomingSessions(
      visibleBatches,
      today,
      todayAttendance,
      expectedPairs,
    );

    const recentActivity = this.buildRecentActivity(
      activityLogs,
      recentAttendanceEvents,
      recentAssessments,
    );

    const studentsRequiringAttention = await this.buildStudentsRequiringAttention(
      user,
      batchIds,
      periodAttendanceWhere,
      periodAssessments,
      query.batchId,
    );

    return {
      role: user.role,
      lastUpdated: new Date().toISOString(),
      filters: {
        from: toDateOnlyString(analyticsRange.from),
        to: toDateOnlyString(addUtcDays(analyticsRange.to, -1)),
        batchId: query.batchId ?? null,
        batchCourseId: query.batchCourseId ?? null,
        assessmentType: query.assessmentType ?? null,
      },
      summary: {
        assignedBatches: batchIds.length,
        activeStudents,
        todaysAttendance: todayAttendance.filter(
          (row) =>
            row.status === AttendanceStatus.PRESENT ||
            row.status === AttendanceStatus.LATE,
        ).length,
        todaysAttendanceMarked: todaysMarked,
        todaysAttendanceExpected: todaysExpected,
        todaysAttendanceMarkedPercent: todaysMarkedPercent,
        pendingAttendance,
        upcomingAssessments: upcomingAssessments.length,
        recentAssessmentsCount,
      },
      attendanceTrend,
      attendanceSummary,
      batchOverview,
      assessmentPerformance: {
        averagePercentage: assessmentSummary.averagePercentage,
        studentsAssessed,
        marksEntered: assessmentSummary.marksEntered,
        upcoming: upcomingAssessments.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          date: item.date,
          batchId: item.batch.id,
          batchName: item.batch.name,
          sessionLabel: item.batchCourse
            ? formatAttendanceSessionLabel(
                item.batchCourse.session?.sessionNumber,
                item.batchCourse.course.title,
              )
            : null,
          courseTitle: item.batchCourse?.course.title ?? null,
        })),
        recent: recentAssessments.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          date: item.date,
          obtainedMarks: Number(item.obtainedMarks),
          maxMarks: Number(item.maxMarks),
          studentName: [item.student.firstName, item.student.lastName]
            .filter(Boolean)
            .join(' '),
          batchName: item.batch.name,
        })),
        byType,
        byBatchType,
      },
      upcomingSessions,
      recentActivity,
      studentsRequiringAttention,
      recentAssessments: recentAssessments.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        date: item.date,
        obtainedMarks: Number(item.obtainedMarks),
        maxMarks: Number(item.maxMarks),
        studentName: [item.student.firstName, item.student.lastName]
          .filter(Boolean)
          .join(' '),
        batchName: item.batch.name,
      })),
      assessmentTypes: ASSESSMENT_TYPES,
      // Legacy fields for backward compatibility
      assignedBatches: batchIds.length,
      students: activeStudents,
      todaysAttendance: todayAttendance.filter(
        (row) => row.status === AttendanceStatus.PRESENT,
      ).length,
      pendingAttendance,
      upcomingTests: upcomingAssessments.filter((row) => row.type === 'TEST')
        .length,
    };
  }

  private resolveAnalyticsRange(from?: string, to?: string) {
    if (from || to) {
      const rangeFrom = from
        ? parseDateOnly(from)
        : startOfUtcDay(new Date());
      const rangeTo = to
        ? addUtcDays(parseDateOnly(to), 1)
        : addUtcDays(startOfUtcDay(new Date()), 1);
      if (rangeFrom.getTime() >= rangeTo.getTime()) {
        throw new BadRequestException('Invalid date range');
      }
      return { from: rangeFrom, to: rangeTo };
    }

    return getPeriodRange('weekly', new Date());
  }

  private buildTrendSeries(
    from: Date,
    to: Date,
    trendMap: Map<string, { present: number; absent: number; late: number }>,
  ) {
    const series: Array<{
      date: string;
      label: string;
      present: number;
      absent: number;
      late: number;
    }> = [];

    let cursor = new Date(from);
    while (cursor.getTime() < to.getTime()) {
      const key = toDateOnlyString(cursor);
      const counts = trendMap.get(key) ?? {
        present: 0,
        absent: 0,
        late: 0,
      };
      series.push({
        date: key,
        label: cursor.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          timeZone: 'UTC',
        }),
        ...counts,
      });
      cursor = addUtcDays(cursor, 1);
    }

    return series;
  }

  private async buildBatchOverview(
    batches: Array<{
      id: string;
      name: string;
      code: string;
      course: { title: string } | null;
    }>,
    user: BranchAuthUser,
    today: Date,
    expectedPairs: Array<{ studentId: string; batchId: string }>,
    todayAttendance: Array<{
      studentId: string;
      batchId: string;
      status: AttendanceStatus;
    }>,
    periodAttendanceWhere: Prisma.AttendanceWhereInput,
  ) {
    if (!batches.length) return [];

    const batchIds = batches.map((batch) => batch.id);

    const [enrollmentCounts, batchStatusGroups, conductedByBatch] =
      await Promise.all([
        this.prisma.enrollment.groupBy({
          by: ['batchId'],
          where: {
            batchId: { in: batchIds },
            isDeleted: false,
            status: {
              in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
            },
          },
          _count: { _all: true },
        }),
        this.prisma.attendance.groupBy({
          by: ['batchId', 'status'],
          where: periodAttendanceWhere,
          _count: { _all: true },
        }),
        this.prisma.attendance.groupBy({
          by: ['batchId', 'date', 'batchCourseId'],
          where: periodAttendanceWhere,
        }),
      ]);

    const enrollmentByBatch = new Map(
      enrollmentCounts.map((row) => [row.batchId, row._count._all]),
    );

    const statusByBatch = new Map<
      string,
      { present: number; absent: number; late: number; total: number }
    >();
    for (const group of batchStatusGroups) {
      const current = statusByBatch.get(group.batchId) ?? {
        present: 0,
        absent: 0,
        late: 0,
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
      statusByBatch.set(group.batchId, current);
    }

    const sessionsByBatch = new Map<string, number>();
    const sessionKeys = new Set<string>();
    for (const row of conductedByBatch) {
      const key = `${row.batchId}:${toDateOnlyString(row.date)}:${row.batchCourseId}`;
      if (sessionKeys.has(key)) continue;
      sessionKeys.add(key);
      sessionsByBatch.set(
        row.batchId,
        (sessionsByBatch.get(row.batchId) ?? 0) + 1,
      );
    }

    return batches.map((batch) => {
      const expected = expectedPairs.filter(
        (row) => row.batchId === batch.id,
      ).length;
      const recorded = new Set(
        todayAttendance
          .filter((row) => row.batchId === batch.id)
          .map((row) => row.studentId),
      ).size;
      const stats = statusByBatch.get(batch.id);
      const attended = (stats?.present ?? 0) + (stats?.late ?? 0);
      const total = stats?.total ?? 0;

      return {
        id: batch.id,
        name: batch.name,
        code: batch.code,
        courseTitle: batch.course?.title ?? '—',
        activeStudents: enrollmentByBatch.get(batch.id) ?? 0,
        sessionsConducted: sessionsByBatch.get(batch.id) ?? 0,
        attendancePercentage:
          total > 0 ? Math.round((attended / total) * 1000) / 10 : null,
        pendingAttendance: Math.max(0, expected - recorded),
        upcomingSession: null as string | null,
      };
    });
  }

  private buildUpcomingSessions(
    batches: Array<{
      id: string;
      name: string;
      code: string;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
      daysOfWeek: DayOfWeek[];
      course: { title: string } | null;
      batchCourses: Array<{
        id: string;
        course: { title: string };
        session: { sessionNumber: number | null } | null;
      }>;
    }>,
    today: Date,
    todayAttendance: Array<{ batchId: string; studentId: string }>,
    expectedPairs: Array<{ batchId: string; studentId: string }>,
  ) {
    const sessions: Array<{
      date: string;
      startTime: string;
      endTime: string;
      batchId: string;
      batchName: string;
      batchCode: string;
      courseTitle: string;
      sessionLabel: string;
      batchCourseId: string;
      attendanceStatus: 'COMPLETE' | 'PARTIAL' | 'PENDING';
    }> = [];

    for (let offset = 0; offset < 14; offset += 1) {
      const date = addUtcDays(today, offset);
      const dow = UTC_DAY_TO_DOW[date.getUTCDay()];

      for (const batch of batches) {
        if (!batch.daysOfWeek.includes(dow)) continue;
        const start = startOfUtcDay(batch.startDate);
        const end = batch.endDate ? startOfUtcDay(batch.endDate) : null;
        if (date.getTime() < start.getTime()) continue;
        if (end && date.getTime() > end.getTime()) continue;

        const courses = batch.batchCourses.length
          ? batch.batchCourses
          : [
              {
                id: `${batch.id}-default`,
                course: { title: batch.course?.title ?? 'Course' },
                session: null,
              },
            ];

        for (const assignment of courses) {
          const expected = expectedPairs.filter(
            (row) => row.batchId === batch.id,
          ).length;
          const recorded = new Set(
            todayAttendance
              .filter(
                (row) =>
                  row.batchId === batch.id &&
                  toDateOnlyString(date) === toDateOnlyString(today),
              )
              .map((row) => row.studentId),
          ).size;

          let attendanceStatus: 'COMPLETE' | 'PARTIAL' | 'PENDING' = 'PENDING';
          if (recorded > 0 && recorded >= expected) {
            attendanceStatus = 'COMPLETE';
          } else if (recorded > 0) {
            attendanceStatus = 'PARTIAL';
          }

          sessions.push({
            date: toDateOnlyString(date),
            startTime: batch.startTime,
            endTime: batch.endTime,
            batchId: batch.id,
            batchName: batch.name,
            batchCode: batch.code,
            courseTitle: assignment.course.title,
            sessionLabel: formatAttendanceSessionLabel(
              assignment.session?.sessionNumber ?? null,
              assignment.course.title,
            ),
            batchCourseId: assignment.id,
            attendanceStatus:
              toDateOnlyString(date) === toDateOnlyString(today)
                ? attendanceStatus
                : 'PENDING',
          });
        }
      }
    }

    return sessions
      .sort((a, b) =>
        a.date === b.date
          ? a.startTime.localeCompare(b.startTime)
          : a.date.localeCompare(b.date),
      )
      .slice(0, 12);
  }

  private buildRecentActivity(
    activityLogs: Array<{
      id: string;
      action: string;
      resourceType: string;
      createdAt: Date;
      metadata: Prisma.JsonValue;
    }>,
    attendanceEvents: Array<{
      id: string;
      status: AttendanceStatus;
      date: Date;
      updatedAt: Date;
      student: {
        firstName: string;
        lastName: string | null;
        studentCode: string;
      };
      batch: { name: string };
      batchCourse: {
        course: { title: string };
        session: { sessionNumber: number | null } | null;
      } | null;
    }>,
    assessments: Array<{
      id: string;
      name: string;
      type: string;
      createdAt: Date;
      student: { firstName: string; lastName: string | null };
      batch: { name: string };
    }>,
  ) {
    const items: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string | null;
      status: string | null;
      occurredAt: string;
    }> = [];

    for (const log of activityLogs) {
      items.push({
        id: log.id,
        type: log.action,
        title: this.formatActivityAction(log.action),
        subtitle: log.resourceType,
        status: null,
        occurredAt: log.createdAt.toISOString(),
      });
    }

    for (const row of attendanceEvents) {
      const sessionLabel = row.batchCourse
        ? formatAttendanceSessionLabel(
            row.batchCourse.session?.sessionNumber,
            row.batchCourse.course.title,
          )
        : null;
      items.push({
        id: row.id,
        type: 'ATTENDANCE',
        title: 'Attendance marked',
        subtitle: sessionLabel
          ? `${sessionLabel} · ${row.batch.name}`
          : row.batch.name,
        status: row.status,
        occurredAt: row.updatedAt.toISOString(),
      });
    }

    for (const row of assessments) {
      items.push({
        id: row.id,
        type: 'ASSESSMENT',
        title: 'Assessment created',
        subtitle: `${row.name} · ${row.batch.name}`,
        status: 'RECORDED',
        occurredAt: row.createdAt.toISOString(),
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 15);
  }

  private formatActivityAction(action: string): string {
    return action
      .split('_')
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(' ');
  }

  private async buildStudentsRequiringAttention(
    user: BranchAuthUser,
    batchIds: string[],
    periodAttendanceWhere: Prisma.AttendanceWhereInput,
    periodAssessments: Array<{ studentId: string }>,
    batchId?: string,
  ) {
    if (!batchIds.length) return [];

    const allEnrollments = await this.prisma.enrollment.findMany({
      where: {
        isDeleted: false,
        status: {
          in: [EnrollmentStatus.ADMITTED, EnrollmentStatus.ACTIVE],
        },
        batchId: batchId ? batchId : { in: batchIds },
        batch: { branchId: user.branchId, isDeleted: false },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentCode: true,
          },
        },
        batch: { select: { id: true, name: true, code: true } },
      },
    });

    const studentIds = allEnrollments.map((row) => row.student.id);

    const [statusByStudent, conductedByStudent] = await Promise.all([
      this.prisma.attendance.groupBy({
        by: ['studentId', 'status'],
        where: {
          ...periodAttendanceWhere,
          studentId: { in: studentIds },
        },
        _count: { _all: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['studentId', 'date', 'batchCourseId'],
        where: {
          ...periodAttendanceWhere,
          studentId: { in: studentIds },
        },
      }),
    ]);

    const countsMap = new Map<string, ReturnType<typeof emptyStatusCounts>>();
    for (const group of statusByStudent) {
      const current = countsMap.get(group.studentId) ?? emptyStatusCounts();
      applyStatusCount(current, group.status, group._count._all);
      countsMap.set(group.studentId, current);
    }

    const conductedMap = new Map<string, number>();
    const conductedKeys = new Set<string>();
    for (const row of conductedByStudent) {
      const key = `${row.studentId}:${toDateOnlyString(row.date)}:${row.batchCourseId}`;
      if (conductedKeys.has(key)) continue;
      conductedKeys.add(key);
      conductedMap.set(
        row.studentId,
        (conductedMap.get(row.studentId) ?? 0) + 1,
      );
    }

    const assessedStudents = new Set(
      periodAssessments.map((row) => row.studentId),
    );

    const flagged: Array<{
      studentId: string;
      studentName: string;
      studentCode: string;
      batchId: string;
      batchName: string;
      reason: string;
      attendancePercentage: number | null;
      absentCount: number;
    }> = [];

    for (const enrollment of allEnrollments) {
      const studentId = enrollment.student.id;
      const counts = countsMap.get(studentId) ?? emptyStatusCounts();
      const conducted = conductedMap.get(studentId) ?? 0;
      const stats = buildAttendanceAnalyticsStats(counts, conducted);
      const reasons: string[] = [];

      if (counts.absent >= 2) {
        reasons.push(`Frequent absence (${counts.absent})`);
      }
      if (stats.percentage !== null && stats.percentage < 75) {
        reasons.push(`Low attendance (${stats.percentage}%)`);
      }
      if (conducted > 0 && !stats.hasAttendance) {
        reasons.push('No attendance recorded');
      }
      if (conducted > 0 && !assessedStudents.has(studentId)) {
        reasons.push('Pending assessment');
      }

      if (!reasons.length) continue;

      flagged.push({
        studentId,
        studentName: [enrollment.student.firstName, enrollment.student.lastName]
          .filter(Boolean)
          .join(' '),
        studentCode: enrollment.student.studentCode,
        batchId: enrollment.batch.id,
        batchName: enrollment.batch.name,
        reason: reasons[0],
        attendancePercentage: stats.percentage,
        absentCount: counts.absent,
      });
    }

    return flagged
      .sort((a, b) => (b.absentCount ?? 0) - (a.absentCount ?? 0))
      .slice(0, 10);
  }
}
