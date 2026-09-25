import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  BatchStatus,
  CourseMode,
  CourseStatus,
  EnrollmentStatus,
  InterviewStatus,
  Prisma,
  TrainerStatus,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  listDateKeys,
  previousPeriod,
  resolveAdminDashboardPeriod,
} from '../../admin-dashboard/application/admin-dashboard-date.util';
import { BranchOperationsAccessService } from './branch-operations-access.service';
import { facultyBranchEnrollmentWhere } from './faculty-batch-query';
import { buildBranchJobApplicationListInterviewScope } from './utils/branch-job-application-assignment.util';
import { countBatchDateLifecycleTabs } from './utils/batch-date-lifecycle-tab.util';

const ACTIVE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ACTIVE,
  EnrollmentStatus.ADMITTED,
];

function isValidScheduleDate(value: Date | null | undefined): value is Date {
  if (!value) return false;
  return value.getTime() > new Date('2000-01-01').getTime();
}

function modeLabel(mode: CourseMode): string {
  if (mode === CourseMode.OFFLINE) return 'Offline / Classroom';
  if (mode === CourseMode.ONLINE) return 'Online';
  return 'Self-Paced / Pre-Recorded';
}

function metricWithComparison(current: number, previous: number) {
  const delta = current - previous;
  const deltaPercent =
    previous === 0 ? (current === 0 ? 0 : null) : (delta / previous) * 100;
  return {
    value: current,
    comparison: {
      previousValue: previous,
      delta,
      deltaPercent,
    },
  };
}

function mergeModeCounts(
  batchGroups: { mode: CourseMode; _count: { _all: number } }[],
  timingGroups: { mode: CourseMode; _count: { _all: number } }[],
) {
  const map = new Map<CourseMode, number>();
  for (const row of batchGroups) {
    map.set(row.mode, (map.get(row.mode) ?? 0) + row._count._all);
  }
  for (const row of timingGroups) {
    map.set(row.mode, (map.get(row.mode) ?? 0) + row._count._all);
  }
  return [...map.entries()].map(([mode, count]) => ({
    mode,
    modeLabel: modeLabel(mode),
    count,
  }));
}

function formatPersonName(row: {
  firstName: string;
  lastName: string | null;
  studentCode?: string;
}): string {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ');
  return name || row.studentCode || 'Student';
}

@Injectable()
export class BranchManagerDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async getAnalytics(
    user: BranchAuthUser,
    query: { preset?: string; from?: string; to?: string },
  ) {
    const branchId = user.branchId;
    let period;
    try {
      period = resolveAdminDashboardPeriod(query);
    } catch {
      throw new BadRequestException('Invalid dashboard date range');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: branchId, deletedAt: null },
      select: { id: true, branchName: true, branchCode: true, status: true },
    });

    if (!branch) {
      throw new BadRequestException('Branch not found');
    }

    const { from, toExclusive } = period;
    const prev = previousPeriod(from, toExclusive);
    const dateKeys = listDateKeys(from, toExclusive);
    const now = new Date();

    const enrollmentBase = facultyBranchEnrollmentWhere(branchId);
    const batchBase = await this.access.branchBatchWhere(user);
    const branchLifecycleBatchRows = await this.prisma.batch.findMany({
      where: batchBase,
      select: { startDate: true, endDate: true },
    });
    const batchLifecycleCounts = countBatchDateLifecycleTabs(
      branchLifecycleBatchRows,
    );
    const upcomingBatches = batchLifecycleCounts.upcoming;
    const ongoingBatches = batchLifecycleCounts.ongoing;
    const expiredBatches = batchLifecycleCounts.expired;

    const jobInterviewScope = buildBranchJobApplicationListInterviewScope({
      branchId,
    });

    const jobApplicationBase: Prisma.JobApplicationWhereInput = {
      isDeleted: false,
      interviews: { some: jobInterviewScope },
    };

    const [
      activeEnrollmentRows,
      enrollmentStatusGroups,
      enrollmentPaymentGroups,
      totalEnrollments,
      activeEnrollments,
      enrollmentsInPeriod,
      enrollmentsPrevious,
      jobApplicationsInPeriod,
      jobApplicationsPreviousPeriod,
      batchModeGroups,
      timingModeGroups,
      popularCoursesRaw,
      batchEnrollmentGroups,
      recentEnrollments,
      recentJobApplications,
      upcomingBatchRows,
      upcomingTimingRows,
      upcomingInterviews,
      branchTrainerIds,
      batchTrainerAssignments,
    ] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: {
          ...enrollmentBase,
          status: { in: ACTIVE_ENROLLMENT_STATUSES },
        },
        select: { studentId: true },
        distinct: ['studentId'],
      }),
      this.prisma.enrollment.groupBy({
        by: ['status'],
        where: enrollmentBase,
        _count: { _all: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['paymentStatus'],
        where: enrollmentBase,
        _count: { _all: true },
      }),
      this.prisma.enrollment.count({ where: enrollmentBase }),
      this.prisma.enrollment.count({
        where: {
          ...enrollmentBase,
          status: { in: ACTIVE_ENROLLMENT_STATUSES },
        },
      }),
      this.prisma.enrollment.count({
        where: {
          ...enrollmentBase,
          createdAt: { gte: from, lt: toExclusive },
        },
      }),
      this.prisma.enrollment.count({
        where: {
          ...enrollmentBase,
          createdAt: { gte: prev.from, lt: prev.toExclusive },
        },
      }),
      this.prisma.jobApplication.count({
        where: {
          ...jobApplicationBase,
          createdAt: { gte: from, lt: toExclusive },
        },
      }),
      this.prisma.jobApplication.count({
        where: {
          ...jobApplicationBase,
          createdAt: { gte: prev.from, lt: prev.toExclusive },
        },
      }),
      this.prisma.batch.groupBy({
        by: ['mode'],
        where: batchBase,
        _count: { _all: true },
      }),
      this.prisma.batchTiming.groupBy({
        by: ['mode'],
        where: {
          isDeleted: false,
          batch: batchBase,
        },
        _count: { _all: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['courseId'],
        where: enrollmentBase,
        _count: { _all: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: 6,
      }),
      this.prisma.enrollment.groupBy({
        by: ['batchId'],
        where: enrollmentBase,
        _count: { _all: true },
        orderBy: { _count: { batchId: 'desc' } },
        take: 8,
      }),
      this.prisma.enrollment.findMany({
        where: enrollmentBase,
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          enrollmentNumber: true,
          status: true,
          createdAt: true,
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentCode: true,
            },
          },
          course: { select: { title: true } },
        },
      }),
      this.prisma.jobApplication.findMany({
        where: jobApplicationBase,
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          status: true,
          createdAt: true,
          applicantName: true,
          Student: {
            select: { firstName: true, lastName: true, studentCode: true },
          },
          job: { select: { title: true, companyName: true } },
        },
      }),
      this.prisma.batch.findMany({
        where: {
          ...batchBase,
          status: BatchStatus.UPCOMING,
          startDate: { gte: now },
        },
        orderBy: { startDate: 'asc' },
        take: 8,
        select: {
          id: true,
          name: true,
          mode: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          course: { select: { title: true } },
          timings: {
            where: { isDeleted: false },
            orderBy: { displayOrder: 'asc' },
            take: 3,
            select: {
              id: true,
              name: true,
              mode: true,
              startDate: true,
              endDate: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      }),
      this.prisma.batchTiming.findMany({
        where: {
          isDeleted: false,
          status: BatchStatus.UPCOMING,
          startDate: { gte: now },
          batch: batchBase,
        },
        orderBy: { startDate: 'asc' },
        take: 8,
        select: {
          id: true,
          name: true,
          mode: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          batch: {
            select: {
              id: true,
              name: true,
              course: { select: { title: true } },
            },
          },
        },
      }),
      this.prisma.interview.findMany({
        where: {
          branchId,
          status: { not: InterviewStatus.CANCELLED },
          scheduledAt: {
            gte: now,
            lt: new Date(now.getTime() + 30 * 86_400_000),
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 6,
        select: {
          id: true,
          applicationId: true,
          scheduledAt: true,
          status: true,
          job: { select: { title: true } },
          application: {
            select: {
              applicantName: true,
              Student: {
                select: {
                  firstName: true,
                  lastName: true,
                  studentCode: true,
                },
              },
            },
          },
          branch: { select: { branchName: true } },
        },
      }),
      this.prisma.branchTrainer.findMany({
        where: { branchId },
        select: { trainerId: true },
        distinct: ['trainerId'],
      }),
      this.prisma.branchTrainer.count({ where: { branchId } }),
    ]);

    const assignedTrainerIds = branchTrainerIds.map((row) => row.trainerId);
    const [activeTrainers, totalTrainers, activeCourses, totalCourses] =
      assignedTrainerIds.length
        ? await Promise.all([
            this.prisma.trainer.count({
              where: {
                id: { in: assignedTrainerIds },
                isDeleted: false,
                status: TrainerStatus.ACTIVE,
              },
            }),
            this.prisma.trainer.count({
              where: {
                id: { in: assignedTrainerIds },
                isDeleted: false,
              },
            }),
            this.prisma.course.count({
              where: {
                isDeleted: false,
                status: CourseStatus.ACTIVE,
                enrollments: { some: enrollmentBase },
              },
            }),
            this.prisma.course.count({
              where: {
                isDeleted: false,
                enrollments: { some: enrollmentBase },
              },
            }),
          ])
        : [0, 0, 0, 0];

    const studentGrowthMap = new Map<string, number>();
    const enrollmentSeriesMap = new Map<string, number>();
    for (const key of dateKeys) {
      studentGrowthMap.set(key, 0);
      enrollmentSeriesMap.set(key, 0);
    }

    const enrollmentsInRangeRows = await this.prisma.enrollment.findMany({
      where: {
        ...enrollmentBase,
        createdAt: { gte: from, lt: toExclusive },
      },
      select: { createdAt: true, studentId: true },
    });

    const studentsSeenPerDay = new Map<string, Set<string>>();
    for (const row of enrollmentsInRangeRows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (!studentGrowthMap.has(key)) continue;
      enrollmentSeriesMap.set(
        key,
        (enrollmentSeriesMap.get(key) ?? 0) + 1,
      );
      const set = studentsSeenPerDay.get(key) ?? new Set<string>();
      if (!set.has(row.studentId)) {
        set.add(row.studentId);
        studentGrowthMap.set(key, (studentGrowthMap.get(key) ?? 0) + 1);
      }
      studentsSeenPerDay.set(key, set);
    }

    const courseIds = popularCoursesRaw.map((row) => row.courseId);
    const coursesById = courseIds.length
      ? await this.prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true, code: true },
        })
      : [];
    const courseTitleMap = new Map(
      coursesById.map((course) => [course.id, course]),
    );

    const batchIds = batchEnrollmentGroups.map((row) => row.batchId);
    const batchesById = batchIds.length
      ? await this.prisma.batch.findMany({
          where: { id: { in: batchIds } },
          select: { id: true, name: true, code: true },
        })
      : [];
    const batchMap = new Map(batchesById.map((item) => [item.id, item]));

    const modeDistribution = mergeModeCounts(batchModeGroups, timingModeGroups);
    const activeStudentCount = activeEnrollmentRows.length;

    const recentActivity = this.buildRecentActivity({
      recentEnrollments,
      recentJobApplications,
    });

    const upcomingSchedule = this.buildUpcomingSchedule({
      upcomingBatchRows,
      upcomingTimingRows,
      upcomingInterviews,
    });

    return {
      branch: {
        id: branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
      },
      period: {
        preset: period.preset,
        from: period.fromLabel,
        to: period.toLabel,
      },
      metrics: {
        totalJobApplications: metricWithComparison(
          jobApplicationsInPeriod,
          jobApplicationsPreviousPeriod,
        ),
        activeStudents: { value: activeStudentCount },
        totalStudents: { value: activeStudentCount },
        activeEnrollments: { value: activeEnrollments },
        totalEnrollments: metricWithComparison(
          enrollmentsInPeriod,
          enrollmentsPrevious,
        ),
        newEnrollmentsInPeriod: metricWithComparison(
          enrollmentsInPeriod,
          enrollmentsPrevious,
        ),
        newStudentsInPeriod: metricWithComparison(
          enrollmentsInPeriod,
          enrollmentsPrevious,
        ),
        upcomingBatches: { value: upcomingBatches },
        ongoingBatches: { value: ongoingBatches },
        expiredBatches: { value: expiredBatches },
        totalBranches: { value: 1 },
        activeBranches: { value: 1 },
        totalCourses: { value: totalCourses },
        activeCourses: { value: activeCourses },
        totalTrainers: { value: totalTrainers },
        activeTrainers: { value: activeTrainers },
        trainersOnBatches: { value: batchTrainerAssignments },
        trainersWithBranchAssignments: { value: assignedTrainerIds.length },
      },
      students: {
        activeCount: activeStudentCount,
        newInPeriod: enrollmentsInPeriod,
        byStatus: enrollmentStatusGroups.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        archivedCount: 0,
        growthSeries: dateKeys.map((date) => ({
          date,
          count: studentGrowthMap.get(date) ?? 0,
        })),
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        newInPeriod: enrollmentsInPeriod,
        byStatus: enrollmentStatusGroups.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        byPaymentStatus: enrollmentPaymentGroups.map((row) => ({
          status: row.paymentStatus,
          count: row._count._all,
        })),
        trendSeries: dateKeys.map((date) => ({
          date,
          count: enrollmentSeriesMap.get(date) ?? 0,
        })),
      },
      batches: {
        upcoming: upcomingBatches,
        ongoing: ongoingBatches,
        expired: expiredBatches,
        modeDistribution,
        upcomingList: upcomingBatchRows.map((batch) => ({
          id: batch.id,
          batchName: batch.name,
          courseTitle: batch.course?.title ?? null,
          startDate: batch.startDate.toISOString(),
          endDate: batch.endDate?.toISOString() ?? null,
          mode: batch.mode,
          modeLabel: modeLabel(batch.mode),
          startTime: batch.startTime,
          endTime: batch.endTime,
          timings: batch.timings.map((timing) => ({
            id: timing.id,
            name: timing.name,
            mode: timing.mode,
            modeLabel: modeLabel(timing.mode),
            startDate: timing.startDate.toISOString(),
            endDate: timing.endDate?.toISOString() ?? null,
            startTime: timing.startTime,
            endTime: timing.endTime,
          })),
        })),
      },
      branches: {
        total: 1,
        active: 1,
        enrollmentDistribution: batchEnrollmentGroups.map((row) => {
          const batch = batchMap.get(row.batchId);
          return {
            branchId: row.batchId,
            branchName: batch?.name ?? 'Batch',
            branchCode: batch?.code ?? '',
            status: null,
            enrollmentCount: row._count._all,
          };
        }),
      },
      courses: {
        total: totalCourses,
        active: activeCourses,
        topByEnrollments: popularCoursesRaw
          .map((row) => {
            const course = courseTitleMap.get(row.courseId);
            if (!course) return null;
            return {
              courseId: course.id,
              title: course.title,
              code: course.code,
              enrollmentCount: row._count._all,
            };
          })
          .filter(Boolean),
      },
      trainers: {
        total: totalTrainers,
        active: activeTrainers,
        withBranchAssignments: assignedTrainerIds.length,
        batchAssignments: batchTrainerAssignments,
      },
      recentActivity,
      upcomingSchedule,
    };
  }

  private buildRecentActivity(input: {
    recentEnrollments: {
      id: string;
      enrollmentNumber: string;
      status: string;
      createdAt: Date;
      student: {
        id: string;
        firstName: string;
        lastName: string | null;
        studentCode: string;
      };
      course: { title: string } | null;
    }[];
    recentJobApplications: {
      id: string;
      status: string;
      createdAt: Date;
      applicantName: string | null;
      Student: {
        firstName: string;
        lastName: string | null;
        studentCode: string;
      } | null;
      job: { title: string; companyName: string | null };
    }[];
  }) {
    const items: {
      id: string;
      type: string;
      title: string;
      subtitle: string;
      href: string;
      occurredAt: string;
    }[] = [];

    for (const row of input.recentEnrollments) {
      items.push({
        id: `enrollment-${row.id}`,
        type: 'Enrollment',
        title: formatPersonName(row.student),
        subtitle: `${row.enrollmentNumber} · ${row.course?.title ?? 'Course'}`,
        href: `/students/${row.student.id}`,
        occurredAt: row.createdAt.toISOString(),
      });
    }

    for (const row of input.recentJobApplications) {
      const student = row.Student;
      items.push({
        id: `application-${row.id}`,
        type: 'Job application',
        title:
          row.applicantName?.trim() ||
          (student ? formatPersonName(student) : 'Applicant'),
        subtitle: `${row.job.title}${row.job.companyName ? ` · ${row.job.companyName}` : ''}`,
        href: `/job-applications/${row.id}`,
        occurredAt: row.createdAt.toISOString(),
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
      )
      .slice(0, 12);
  }

  private buildUpcomingSchedule(input: {
    upcomingBatchRows: {
      id: string;
      name: string;
      mode: CourseMode;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
      course: { title: string } | null;
    }[];
    upcomingTimingRows: {
      id: string;
      name: string;
      mode: CourseMode;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
      batch: {
        id: string;
        name: string;
        course: { title: string } | null;
      };
    }[];
    upcomingInterviews: {
      id: string;
      applicationId: string;
      scheduledAt: Date | null;
      status: string;
      job: { title: string };
      application: {
        applicantName: string | null;
        Student: {
          firstName: string;
          lastName: string | null;
          studentCode: string;
        } | null;
      };
      branch: { branchName: string };
    }[];
  }) {
    const items: {
      id: string;
      kind: 'batch' | 'timing' | 'interview';
      title: string;
      subtitle: string;
      startsAt: string;
      endAt: string | null;
      modeLabel: string | null;
      timeLabel: string | null;
      href: string;
    }[] = [];

    for (const batch of input.upcomingBatchRows) {
      if (!isValidScheduleDate(batch.startDate)) continue;
      items.push({
        id: `batch-${batch.id}`,
        kind: 'batch',
        title: batch.name,
        subtitle: batch.course?.title ?? 'Batch start',
        startsAt: batch.startDate.toISOString(),
        endAt: batch.endDate?.toISOString() ?? null,
        modeLabel: modeLabel(batch.mode),
        timeLabel: `${batch.startTime} – ${batch.endTime}`,
        href: `/batches/${batch.id}`,
      });
    }

    for (const timing of input.upcomingTimingRows) {
      if (!isValidScheduleDate(timing.startDate)) continue;
      items.push({
        id: `timing-${timing.id}`,
        kind: 'timing',
        title: timing.name,
        subtitle: `${timing.batch.name}${timing.batch.course?.title ? ` · ${timing.batch.course.title}` : ''}`,
        startsAt: timing.startDate.toISOString(),
        endAt: timing.endDate?.toISOString() ?? null,
        modeLabel: modeLabel(timing.mode),
        timeLabel: `${timing.startTime} – ${timing.endTime}`,
        href: `/batches/${timing.batch.id}`,
      });
    }

    for (const interview of input.upcomingInterviews) {
      if (!isValidScheduleDate(interview.scheduledAt)) continue;
      items.push({
        id: `interview-${interview.id}`,
        kind: 'interview',
        title: interview.job.title,
        subtitle: `${
          interview.application.Student != null
            ? formatPersonName(interview.application.Student)
            : interview.application.applicantName?.trim() || 'Applicant'
        } · ${interview.branch.branchName}`,
        startsAt: interview.scheduledAt.toISOString(),
        endAt: null,
        modeLabel: interview.status,
        timeLabel: null,
        href: `/job-applications/${interview.applicationId}`,
      });
    }

    return items
      .sort(
        (a, b) =>
          new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
      )
      .slice(0, 14);
  }
}
