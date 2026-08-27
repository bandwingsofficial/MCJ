"use client";

import {
  Archive,
  CircleCheck,
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Power,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import type { Job } from "@/src/features/jobs/types/job.types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface JobActionsProps {
  job: Job;
  disabled?: boolean;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onCopyLink: (job: Job) => void;
  onOpenLink: (job: Job) => void;
  onActivate: (job: Job) => void;
  onDeactivate: (job: Job) => void;
  onArchive: (job: Job) => void;
  onRestore: (job: Job) => void;
}

export function JobActions({
  job,
  disabled = false,
  onView,
  onEdit,
  onCopyLink,
  onOpenLink,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
}: JobActionsProps) {
  const status = getJobLifecycleStatus(job);

  if (status === "ARCHIVED") {
    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore job">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(job)}
            aria-label="Restore job"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content="View job">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onView(job)}
          aria-label="View job"
          className={`${iconBtnClass} text-[#647A9B] hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Eye className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Edit job">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(job)}
          aria-label="Edit job"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Copy application link">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onCopyLink(job)}
          aria-label="Copy application link"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Copy className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Open application page">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onOpenLink(job)}
          aria-label="Open application page"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <ExternalLink className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content={isActive ? "Deactivate job" : "Activate job"}>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => (isActive ? onDeactivate(job) : onActivate(job))}
          aria-label={isActive ? "Deactivate job" : "Activate job"}
          className={`${iconBtnClass} ${
            isActive
              ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Archive job">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onArchive(job)}
          aria-label="Archive job"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Archive className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
