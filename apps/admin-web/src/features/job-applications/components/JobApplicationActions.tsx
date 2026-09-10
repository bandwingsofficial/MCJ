"use client";

import { CircleCheck, Eye, X } from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  canApproveApplication,
  canRejectApplication,
} from "@/src/features/job-applications/types/job-application.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface JobApplicationActionsProps {
  application: JobApplication;
  disabled?: boolean;
  onView: (application: JobApplication) => void;
  onApprove: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
}

export function JobApplicationActions({
  application,
  disabled = false,
  onView,
  onApprove,
  onReject,
}: JobApplicationActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="View">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onView(application)}
          aria-label="View application"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Eye className={iconClass} />
        </button>
      </Tooltip>

      {canApproveApplication(application.status) ? (
        <Tooltip content="Approve">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onApprove(application)}
            aria-label="Approve application"
            className={`${iconButtonClass} text-green-800`}
          >
            <CircleCheck className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {canRejectApplication(application.status) ? (
        <Tooltip content="Reject">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onReject(application)}
            aria-label="Reject application"
            className={`${iconButtonClass} text-red-800`}
          >
            <X className={iconClass} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
