"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { Job, JobLifecycleStatus } from "@/src/features/jobs/types/job.types";
import { getOnboardingStatusLabel } from "@/src/features/jobs/utils/job-form.utils";

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
        <Badge variant="warning" className="px-2.5 py-0.5 text-sm">
          Pending
        </Badge>
      );
    }

    if (job.status === "REJECTED") {
      return (
        <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
          Rejected
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-sm">
        {getOnboardingStatusLabel(job.status)}
      </Badge>
    );
  }

  if (job?.isExpired && status === "ACTIVE") {
    return (
      <span className="inline-flex flex-wrap gap-1">
        <Badge variant="success" className="px-2.5 py-0.5 text-sm">
          Active
        </Badge>
        <Badge variant="default" className="px-2.5 py-0.5 text-sm">
          Expired
        </Badge>
      </span>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-sm">
        Active
      </Badge>
    );
  }

  if (status === "INACTIVE") {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Inactive
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="px-2.5 py-0.5 text-sm">
      Archived
    </Badge>
  );
}
