"use client";

import Link from "next/link";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { FacultyDashboard } from "@/src/features/faculty-dashboard";
import { StatCard } from "@/src/features/branch-ops/components/stat-card";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { RoleBadge } from "@/src/shared/components/ui/role-badge";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

function ManagerAndInterviewerDashboard() {
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.dashboard(),
    [],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="No dashboard data yet." />;

  if (role === "INTERVIEWER") {
    return (
      <div>
        <PageHeader
          title="Interviewer Dashboard"
          description="Applications, interviews, and placement decisions."
        />
        <div className="mb-6">
          <RoleBadge role={role} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="New Applications" value={data.newApplications ?? 0} />
          <StatCard label="Pending Interviews" value={data.pendingInterviews ?? 0} />
          <StatCard label="Today's Interviews" value={data.todaysInterviews ?? 0} />
          <StatCard label="Upcoming Interviews" value={data.upcomingInterviews ?? 0} />
          <StatCard label="Completed Interviews" value={data.completedInterviews ?? 0} />
          <StatCard label="Selected Candidates" value={data.selectedCandidates ?? 0} />
          <StatCard label="Rejected Candidates" value={data.rejectedCandidates ?? 0} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Branch Manager Dashboard"
        description="Operations across your assigned branch."
      />
      <div className="mb-6">
        <RoleBadge role={role} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Students" value={data.students ?? 0} />
        <StatCard label="Batches" value={data.batches ?? 0} />
        <StatCard label="Today's Attendance" value={data.todaysAttendance ?? 0} />
        <StatCard label="Pending Interviews" value={data.pendingInterviews ?? 0} />
        <StatCard label="Placements" value={data.placements ?? 0} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="text-indigo-600 hover:underline" href="/attendance">
          Attendance reports
        </Link>
        <Link className="text-indigo-600 hover:underline" href="/assessments">
          Academic tracking
        </Link>
        <Link className="text-indigo-600 hover:underline" href="/users">
          Faculty & interviewers
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === "FACULTY") {
    return <FacultyDashboard />;
  }

  return <ManagerAndInterviewerDashboard />;
}
