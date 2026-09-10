"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { getOnboardingStatusLabel } from "@/src/features/jobs/utils/job-form.utils";
import type { Job, JobLifecycleStatus } from "@/src/features/jobs/types/job.types";
import { isJobExpired } from "@/src/features/jobs/types/job.types";

interface JobStatusBadgeProps {
  status?: JobLifecycleStatus;
  job?: Job;
  variant?: "lifecycle" | "onboarding";
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function JobStatusBadge({
  status,
  job,
  variant = "lifecycle",
}: JobStatusBadgeProps) {
  if (variant === "onboarding" && job) {
    if (job.status === "PENDING_APPROVAL") {
      return (
        <Badge variant="warning" className={compactClass}>
          Pending
        </Badge>
      );
    }

    if (job.status === "REJECTED") {
      return (
        <Badge variant="danger" className={compactClass}>
          Rejected
        </Badge>
      );
    }

    return (
      <Badge variant="success" className={compactClass}>
        {getOnboardingStatusLabel(job.status)}
      </Badge>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  if (status === "INACTIVE") {
    return (
      <Badge variant="danger" className={compactClass}>
        Inactive
      </Badge>
    );
  }

  if (job && isJobExpired(job)) {
    return (
      <Badge variant="default" className={compactClass}>
        Expired
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={compactClass}>
      Active
    </Badge>
  );
}
