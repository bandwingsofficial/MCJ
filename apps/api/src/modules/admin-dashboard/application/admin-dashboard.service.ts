import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  BatchStatus,
  BranchStatus,
  CourseMode,
  CourseStatus,
  EnrollmentStatus,
  PaymentTransactionStatus,
  StudentStatus,
  TrainerStatus,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  listDateKeys,
  previousPeriod,
  resolveAdminDashboardPeriod,
} from './admin-dashboard-date.util';

export interface AdminDashboardQuery {
  preset?: string;
  from?: string;
  to?: string;
}

function decimalToNumber(
  value: Prisma.Decimal | number | null | undefined,
): number {
  if (value == null) return 0;
  return Number(value);
}

function paymentEffectiveDate(payment: {
  paidAt: Date | null;
  createdAt: Date;
}): Date {
  return payment.paidAt ?? payment.createdAt;
}

function isValidScheduleDate(value: Date | null | undefined): value is Date {
  if (!value) return false;
  return value.getTime() > new Date('2000-01-01').getTime();
}

function formatTrainerName(row: {
  firstName: string;
  lastName: string | null;
}): string {
  return [row.firstName, row.lastName].filter(Boolean).join(' ');
}

function formatStudentName(row: {
  firstName: string;
  lastName: string | null;
  studentCode?: string;
}): string {
  const name = [row.firstName, row.lastName].filter(Boolean).join(' ');
  return name || row.studentCode || 'Student';
}

function modeLabel(mode: CourseMode): string {
  if (mode === CourseMode.OFFLINE) return 'Offline / Classroom';
  if (mode === CourseMode.ONLINE) return 'Online';
  return 'Self-Paced / Pre-Recorded';
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(query: AdminDashboardQuery) {
    let period;

    try {
      period = resolveAdminDashboardPeriod(query);
    } catch {
      throw new BadRequestException('Invalid dashboard date range');
    }

    const { from, toExclusive } = period;
    const prev = previousPeriod(from, toExclusive);
    const dateKeys = listDateKeys(from, toExclusive);
    const now = new Date();

    const studentBase = { isDeleted: false } satisfies Prisma.StudentWhereInput;
    const enrollmentBase = {
      isDeleted: false,
    } satisfies Prisma.EnrollmentWhereInput;
    const batchBase = {
      isDeleted: false,
    } satisfies Prisma.BatchWhereInput;
    const branchBase = {
      deletedAt: null,
    } satisfies Prisma.BranchWhereInput;

    const activeEnrollmentStatuses: EnrollmentStatus[] = [
      EnrollmentStatus.ACTIVE,
      EnrollmentStatus.ADMITTED,
    ];

    const [
      totalStudents,
      activeStudentRows,
      studentStatusGroups,
      newStudentsInPeriod,
      newStudentsPrevious,
      inactiveStudents,
      totalEnrollments,
      activeEnrollments,
      enrollmentsInPeriod,
      enrollmentsPrevious,
      enrollmentStatusGroups,
      enrollmentPaymentGroups,
      totalBranches,
      activeBranches,
      totalCourses,
      activeCourses,
      totalTrainers,
      activeTrainers,
      trainersWithBranchAssignment,
      upcomingBatches,
      ongoingBatches,
      ongoingBatchesInPeriod,
      ongoingBatchesPreviousPeriod,
      jobApplicationsInPeriod,
      jobApplicationsPreviousPeriod,
      expiredBatches,
      batchModeGroups,
      timingModeGroups,
      revenuePaymentsAll,
      pendingDueAggregate,
      popularCoursesRaw,
      branchEnrollmentGroups,
      recentEnrollments,
      recentStudents,
      recentBatchTrainers,
      recentJobApplications,
      recentCommunityPosts,
      upcomingBatchRows,
      upcomingTimingRows,
      upcomingInterviews,
    ] = await Promise.all([
      this.prisma.student.count({ where: studentBase }),
      this.prisma.enrollment.findMany({
        where: {
          ...enrollmentBase,
          status: { in: activeEnrollmentStatuses },
          isActive: true,
        },
        select: { studentId: true },
        distinct: ['studentId'],
      }),
      this.prisma.student.groupBy({
        by: ['status'],
        where: studentBase,
        _count: { _all: true },
      }),
      this.prisma.student.count({
        where: {
          ...studentBase,
          createdAt: { gte: from, lt: toExclusive },
        },
      }),
      this.prisma.student.count({
        where: {
          ...studentBase,
          createdAt: { gte: prev.from, lt: prev.toExclusive },
        },
      }),
      this.prisma.student.count({
        where: { isDeleted: true },
      }),
      this.prisma.enrollment.count({ where: enrollmentBase }),
      this.prisma.enrollment.count({
        where: {
          ...enrollmentBase,
          isActive: true,
          status: { in: activeEnrollmentStatuses },
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
      this.prisma.branch.count({ where: branchBase }),
      this.prisma.branch.count({
        where: { ...branchBase, status: BranchStatus.ACTIVE },
      }),
      this.prisma.course.count({ where: { isDeleted: false } }),
      this.prisma.course.count({
        where: {
          isDeleted: false,
          status: CourseStatus.ACTIVE,
        },
      }),
      this.prisma.trainer.count({ where: { isDeleted: false } }),
      this.prisma.trainer.count({
        where: {
          isDeleted: false,
          status: TrainerStatus.ACTIVE,
        },
      }),
      this.prisma.branchTrainer.groupBy({
        by: ['trainerId'],
        _count: { _all: true },
      }),
      this.prisma.batch.count({
        where: { ...batchBase, status: BatchStatus.UPCOMING },
      }),
      this.prisma.batch.count({
        where: { ...batchBase, status: BatchStatus.ONGOING },
      }),
      this.prisma.batch.count({
        where: batchOverlapPeriodWhere(batchBase, from, toExclusive),
      }),
      this.prisma.batch.count({
        where: batchOverlapPeriodWhere(
          batchBase,
          prev.from,
          prev.toExclusive,
        ),
      }),
      this.prisma.jobApplication.count({
        where: {
          isDeleted: false,
          createdAt: { gte: from, lt: toExclusive },
        },
      }),
      this.prisma.jobApplication.count({
        where: {
          isDeleted: false,
          createdAt: { gte: prev.from, lt: prev.toExclusive },
        },
      }),
      this.prisma.batch.count({
        where: { ...batchBase, status: BatchStatus.EXPIRED },
      }),
      this.prisma.batch.groupBy({
        by: ['mode'],
        where: batchBase,
        _count: { _all: true },
      }),
      this.prisma.batchTiming.groupBy({
        by: ['mode'],
        where: { isDeleted: false },
        _count: { _all: true },
      }),
      this.prisma.payment.findMany({
        where: {
          isDeleted: false,
          paymentStatus: PaymentTransactionStatus.SUCCESS,
        },
        select: {
          amount: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      this.prisma.enrollment.aggregate({
        where: enrollmentBase,
        _sum: { dueAmount: true },
      }),
      this.prisma.enrollment.groupBy({
        by: ['courseId'],
        where: enrollmentBase,
        _count: { _all: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: 6,
      }),
      this.prisma.enrollment.groupBy({
        by: ['branchId'],
        where: enrollmentBase,
        _count: { _all: true },
        orderBy: { _count: { branchId: 'desc' } },
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
            select: { firstName: true, lastName: true, studentCode: true },
          },
          course: { select: { title: true } },
        },
      }),
      this.prisma.student.findMany({
        where: studentBase,
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentCode: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.batchTrainer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          createdAt: true,
          batch: { select: { id: true, name: true } },
          trainer: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.jobApplication.findMany({
        where: { isDeleted: false },
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
      this.prisma.communityPost.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          caption: true,
          status: true,
          createdAt: true,
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
    ]);

    const revenueInPeriod = sumPaymentsInRange(
      revenuePaymentsAll,
      from,
      toExclusive,
    );
    const revenuePrevious = sumPaymentsInRange(
      revenuePaymentsAll,
      prev.from,
      prev.toExclusive,
    );

    const revenueSeriesMap = new Map<string, number>();
    for (const key of dateKeys) {
      revenueSeriesMap.set(key, 0);
    }
    for (const payment of revenuePaymentsAll) {
      const effective = paymentEffectiveDate(payment);
      if (
        effective.getTime() < from.getTime() ||
        effective.getTime() >= toExclusive.getTime()
      ) {
        continue;
      }
      const key = effective.toISOString().slice(0, 10);
      if (!revenueSeriesMap.has(key)) continue;
      revenueSeriesMap.set(
        key,
        (revenueSeriesMap.get(key) ?? 0) + decimalToNumber(payment.amount),
      );
    }

    const studentGrowthMap = new Map<string, number>();
    for (const key of dateKeys) {
      studentGrowthMap.set(key, 0);
    }
    const studentsInRange = await this.prisma.student.findMany({
      where: {
        ...studentBase,
        createdAt: { gte: from, lt: toExclusive },
      },
      select: { createdAt: true },
    });
    for (const row of studentsInRange) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (!studentGrowthMap.has(key)) continue;
      studentGrowthMap.set(key, (studentGrowthMap.get(key) ?? 0) + 1);
    }

    const enrollmentSeriesMap = new Map<string, number>();
    for (const key of dateKeys) {
      enrollmentSeriesMap.set(key, 0);
    }
    const enrollmentsInRangeRows = await this.prisma.enrollment.findMany({
      where: {
        ...enrollmentBase,
        createdAt: { gte: from, lt: toExclusive },
      },
      select: { createdAt: true },
    });
    for (const row of enrollmentsInRangeRows) {
      const key = row.createdAt.toISOString().slice(0, 10);
      if (!enrollmentSeriesMap.has(key)) continue;
      enrollmentSeriesMap.set(key, (enrollmentSeriesMap.get(key) ?? 0) + 1);
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

    const branchIds = branchEnrollmentGroups.map((row) => row.branchId);
    const branchesById = branchIds.length
      ? await this.prisma.branch.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, branchName: true, branchCode: true, status: true },
        })
      : [];
    const branchMap = new Map(
      branchesById.map((branch) => [branch.id, branch]),
    );

    const batchTrainerAssignments = await this.prisma.batchTrainer.count();

    const modeDistribution = mergeModeCounts(batchModeGroups, timingModeGroups);

    return {
      period: {
        preset: period.preset,
        from: period.fromLabel,
        to: period.toLabel,
      },
      metrics: {
        totalRevenue: metricWithComparison(
          revenueInPeriod,
          revenuePrevious,
        ),
        totalJobApplications: metricWithComparison(
          jobApplicationsInPeriod,
          jobApplicationsPreviousPeriod,
        ),
        activeStudents: {
          value: activeStudentRows.length,
        },
        totalStudents: {
          value: totalStudents,
        },
        activeEnrollments: {
          value: activeEnrollments,
        },
        totalEnrollments: metricWithComparison(
          enrollmentsInPeriod,
          enrollmentsPrevious,
        ),
        newEnrollmentsInPeriod: metricWithComparison(
          enrollmentsInPeriod,
          enrollmentsPrevious,
        ),
        newStudentsInPeriod: metricWithComparison(
          newStudentsInPeriod,
          newStudentsPrevious,
        ),
        upcomingBatches: { value: upcomingBatches },
        ongoingBatches: metricWithComparison(
          ongoingBatchesInPeriod,
          ongoingBatchesPreviousPeriod,
        ),
        expiredBatches: { value: expiredBatches },
        totalBranches: { value: totalBranches },
        activeBranches: { value: activeBranches },
        totalCourses: { value: totalCourses },
        activeCourses: { value: activeCourses },
        totalTrainers: { value: totalTrainers },
        activeTrainers: { value: activeTrainers },
        trainersOnBatches: { value: batchTrainerAssignments },
        trainersWithBranchAssignments: {
          value: trainersWithBranchAssignment.length,
        },
      },
      revenue: {
        collectedInPeriod: revenueInPeriod,
        pendingDueTotal: decimalToNumber(pendingDueAggregate._sum.dueAmount),
        series: dateKeys.map((date) => ({
          date,
          amount: revenueSeriesMap.get(date) ?? 0,
        })),
      },
      students: {
        activeCount: activeStudentRows.length,
        newInPeriod: newStudentsInPeriod,
        byStatus: studentStatusGroups.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        archivedCount: inactiveStudents,
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
        total: totalBranches,
        active: activeBranches,
        enrollmentDistribution: branchEnrollmentGroups.map((row) => {
          const branch = branchMap.get(row.branchId);
          return {
            branchId: row.branchId,
            branchName: branch?.branchName ?? 'Unknown branch',
            branchCode: branch?.branchCode ?? '',
            status: branch?.status ?? null,
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
        withBranchAssignments: trainersWithBranchAssignment.length,
        batchAssignments: batchTrainerAssignments,
      },
      recentActivity: buildRecentActivity({
        recentEnrollments,
        recentStudents,
        recentBatchTrainers,
        recentJobApplications,
        recentCommunityPosts,
      }),
      upcomingSchedule: buildUpcomingSchedule({
        upcomingBatchRows,
        upcomingTimingRows,
        upcomingInterviews,
      }),
    };
  }
}

function sumPaymentsInRange(
  payments: {
    amount: Prisma.Decimal;
    paidAt: Date | null;
    createdAt: Date;
  }[],
  from: Date,
  toExclusive: Date,
): number {
  let total = 0;
  for (const payment of payments) {
    const effective = paymentEffectiveDate(payment);
    if (
      effective.getTime() >= from.getTime() &&
      effective.getTime() < toExclusive.getTime()
    ) {
      total += decimalToNumber(payment.amount);
    }
  }
  return total;
}

function batchOverlapPeriodWhere(
  batchBase: Prisma.BatchWhereInput,
  from: Date,
  toExclusive: Date,
): Prisma.BatchWhereInput {
  return {
    ...batchBase,
    AND: [
      { startDate: { lt: toExclusive } },
      {
        OR: [{ endDate: null }, { endDate: { gte: from } }],
      },
    ],
  };
}

function metricWithComparison(current: number, previous: number) {
  const delta = current - previous;
  const deltaPercent =
    previous > 0 ? Math.round((delta / previous) * 1000) / 10 : null;

  return {
    value: current,
    comparison: {
      previousValue: previous,
      delta,
      deltaPercent:
        deltaPercent != null && Number.isFinite(deltaPercent)
          ? deltaPercent
          : null,
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
  return Array.from(map.entries()).map(([mode, count]) => ({
    mode,
    modeLabel: modeLabel(mode),
    count,
  }));
}

function buildRecentActivity(input: {
  recentEnrollments: {
    id: string;
    enrollmentNumber: string;
    status: EnrollmentStatus;
    createdAt: Date;
    student: {
      firstName: string;
      lastName: string | null;
      studentCode: string;
    };
    course: { title: string };
  }[];
  recentStudents: {
    id: string;
    firstName: string;
    lastName: string | null;
    studentCode: string;
    status: StudentStatus;
    createdAt: Date;
  }[];
  recentBatchTrainers: {
    id: string;
    createdAt: Date;
    batch: { id: string; name: string };
    trainer: { id: string; firstName: string; lastName: string | null };
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
    job: { title: string; companyName: string };
  }[];
  recentCommunityPosts: {
    id: string;
    caption: string | null;
    status: string;
    createdAt: Date;
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
      title: formatStudentName(row.student),
      subtitle: `${row.course.title} · ${row.enrollmentNumber}`,
      href: `/enrollments/${row.id}`,
      occurredAt: row.createdAt.toISOString(),
    });
  }

  for (const row of input.recentStudents) {
    items.push({
      id: `student-${row.id}`,
      type: 'Student',
      title: formatStudentName(row),
      subtitle: `Registered · ${row.status}`,
      href: `/students/${row.id}`,
      occurredAt: row.createdAt.toISOString(),
    });
  }

  for (const row of input.recentBatchTrainers) {
    items.push({
      id: `batch-trainer-${row.id}`,
      type: 'Trainer assignment',
      title: formatTrainerName(row.trainer),
      subtitle: row.batch.name,
      href: `/batches/${row.batch.id}`,
      occurredAt: row.createdAt.toISOString(),
    });
  }

  for (const row of input.recentJobApplications) {
    const applicant =
      row.Student != null
        ? formatStudentName(row.Student)
        : row.applicantName?.trim() || 'Applicant';
    items.push({
      id: `job-app-${row.id}`,
      type: 'Job application',
      title: applicant,
      subtitle: `${row.job.title} · ${row.job.companyName}`,
      href: `/job-applications/${row.id}`,
      occurredAt: row.createdAt.toISOString(),
    });
  }

  for (const row of input.recentCommunityPosts) {
    items.push({
      id: `community-${row.id}`,
      type: 'Community',
      title: row.caption?.trim() || 'Community post',
      subtitle: row.status,
      href: `/community/${row.id}`,
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

function buildUpcomingSchedule(input: {
  upcomingBatchRows: {
    id: string;
    name: string;
    mode: CourseMode;
    startDate: Date;
    endDate: Date | null;
    startTime: string;
    endTime: string;
    course: { title: string } | null;
    timings: {
      id: string;
      name: string;
      mode: CourseMode;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
    }[];
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
          ? formatStudentName(interview.application.Student)
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

