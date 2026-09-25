export type DashboardDatePreset =
  | "TODAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "THIS_YEAR"
  | "ALL_TIME"
  | "CUSTOM";

export interface DashboardMetricComparison {
  previousValue: number;
  delta: number;
  deltaPercent: number | null;
}

export interface DashboardMetric {
  value: number;
  comparison?: DashboardMetricComparison;
}

export interface BranchManagerDashboardData {
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  };
  period: {
    preset: string;
    from: string;
    to: string;
  };
  metrics: {
    totalJobApplications: DashboardMetric;
    activeStudents: DashboardMetric;
    totalStudents: DashboardMetric;
    activeEnrollments: DashboardMetric;
    totalEnrollments: DashboardMetric;
    newEnrollmentsInPeriod: DashboardMetric;
    newStudentsInPeriod: DashboardMetric;
    upcomingBatches: DashboardMetric;
    ongoingBatches: DashboardMetric;
    expiredBatches: DashboardMetric;
    totalBranches: DashboardMetric;
    activeBranches: DashboardMetric;
    totalCourses: DashboardMetric;
    activeCourses: DashboardMetric;
    totalTrainers: DashboardMetric;
    activeTrainers: DashboardMetric;
    trainersOnBatches: DashboardMetric;
    trainersWithBranchAssignments: DashboardMetric;
  };
  students: {
    activeCount: number;
    newInPeriod: number;
    archivedCount: number;
    byStatus: { status: string; count: number }[];
    growthSeries: { date: string; count: number }[];
  };
  enrollments: {
    total: number;
    active: number;
    newInPeriod: number;
    byStatus: { status: string; count: number }[];
    byPaymentStatus: { status: string; count: number }[];
    trendSeries: { date: string; count: number }[];
  };
  batches: {
    upcoming: number;
    ongoing: number;
    expired: number;
    modeDistribution: { mode: string; modeLabel: string; count: number }[];
    upcomingList: {
      id: string;
      batchName: string;
      courseTitle: string | null;
      startDate: string;
      endDate: string | null;
      mode: string;
      modeLabel: string;
      startTime: string;
      endTime: string;
      timings: {
        id: string;
        name: string;
        mode: string;
        modeLabel: string;
        startDate: string;
        endDate: string | null;
        startTime: string;
        endTime: string;
      }[];
    }[];
  };
  branches: {
    total: number;
    active: number;
    enrollmentDistribution: {
      branchId: string;
      branchName: string;
      branchCode: string;
      status: string | null;
      enrollmentCount: number;
    }[];
  };
  courses: {
    total: number;
    active: number;
    topByEnrollments: {
      courseId: string;
      title: string;
      code: string;
      enrollmentCount: number;
    }[];
  };
  trainers: {
    total: number;
    active: number;
    withBranchAssignments: number;
    batchAssignments: number;
  };
  recentActivity: {
    id: string;
    type: string;
    title: string;
    subtitle: string;
    href: string;
    occurredAt: string;
  }[];
  upcomingSchedule: {
    id: string;
    kind: "batch" | "timing" | "interview";
    title: string;
    subtitle: string;
    startsAt: string;
    endAt: string | null;
    modeLabel: string | null;
    timeLabel: string | null;
    href: string;
  }[];
}

export interface BranchDashboardQuery {
  preset?: DashboardDatePreset;
  from?: string;
  to?: string;
}
