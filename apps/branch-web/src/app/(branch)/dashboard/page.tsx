"use client";

import Link from "next/link";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { BranchManagerDashboardPage } from "@/src/features/dashboard/pages/branch-manager-dashboard-page";
import { FacultyDashboard } from "@/src/features/faculty-dashboard";
import { StatCard } from "@/src/features/branch-ops/components/stat-card";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { RoleBadge } from "@/src/shared/components/ui/role-badge";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";

function InterviewerDashboard() {
  const role = useAuthStore((state) => state.user?.role);
  const branchId = useCurrentBranchId();
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.dashboard(),
    [branchId],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data || !("newApplications" in data)) {
    return <EmptyState title="No dashboard data yet." />;
  }

  return (
    <div>
      <PageHeader
        title="Interviewer Dashboard"
        description="Applications and interviews assigned to you at this branch."
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
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link className="text-indigo-600 hover:underline" href="/interviews">
          Interview workspace
        </Link>
        <Link className="text-indigo-600 hover:underline" href="/job-applications">
          Job applications
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

  if (role === "INTERVIEWER") {
    return <InterviewerDashboard />;
  }

  return <BranchManagerDashboardPage />;
}
