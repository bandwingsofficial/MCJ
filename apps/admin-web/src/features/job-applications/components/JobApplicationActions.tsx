"use client";

import { Check, Eye, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  canApproveApplication,
  canRejectApplication,
} from "@/src/features/job-applications/types/job-application.types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

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
    <div className="flex items-center justify-end gap-1">
      <Tooltip content="View">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onView(application)}
          aria-label="View application"
          className={`${iconBtnClass} text-[#647A9B] hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Eye className={iconClass} />
        </Button>
      </Tooltip>

      {canApproveApplication(application.status) ? (
        <Tooltip content="Approve">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onApprove(application)}
            aria-label="Approve application"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <Check className={iconClass} />
          </Button>
        </Tooltip>
      ) : null}

      {canRejectApplication(application.status) ? (
        <Tooltip content="Reject">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onReject(application)}
            aria-label="Reject application"
            className={`${iconBtnClass} text-rose-600 hover:bg-rose-50 hover:text-rose-700`}
          >
            <X className={iconClass} />
          </Button>
        </Tooltip>
      ) : null}
    </div>
  );
}
