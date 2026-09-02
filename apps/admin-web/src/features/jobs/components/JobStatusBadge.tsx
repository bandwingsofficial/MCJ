"use client";

import { getOnboardingStatusLabel } from "@/src/features/jobs/utils/job-form.utils";
import type { Job, JobLifecycleStatus } from "@/src/features/jobs/types/job.types";
import { isJobExpired } from "@/src/features/jobs/types/job.types";

interface JobStatusBadgeProps {
  status?: JobLifecycleStatus;
  job?: Job;
  variant?: "lifecycle" | "onboarding";
}

export function JobStatusBadge({
  status,
  job,
  variant = "lifecycle",
}: JobStatusBadgeProps) {
  if (variant === "onboarding" && job) {
    if (job.status === "PENDING_APPROVAL") {
      return (
        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-medium text-amber-700">
          Pending
        </span>
      );
    }

    if (job.status === "REJECTED") {
      return (
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-medium text-red-700">
          Rejected
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
        {getOnboardingStatusLabel(job.status)}
      </span>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
        Archived
      </span>
    );
  }

  if (status === "INACTIVE") {
    return (
      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-sm font-medium text-red-700">
        Inactive
      </span>
    );
  }

  if (job && isJobExpired(job)) {
    return (
      <span className="inline-flex rounded-full bg-slate-200/80 px-2.5 py-0.5 text-sm font-medium text-slate-600">
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm font-medium text-emerald-700">
      Active
    </span>
  );
}
