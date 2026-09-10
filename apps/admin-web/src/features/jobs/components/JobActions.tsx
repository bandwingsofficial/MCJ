"use client";

import {
  Archive,
  CircleCheck,
  Eye,
  Pencil,
  Power,
  RotateCcw,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import type { Job } from "@/src/features/jobs/types/job.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface JobActionsProps {
  job: Job;
  disabled?: boolean;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
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
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
}: JobActionsProps) {
  const status = getJobLifecycleStatus(job);

  if (status === "ARCHIVED") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore job">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(job)}
            aria-label="Restore job"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="View job">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onView(job)}
          aria-label="View job"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Eye className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content={isActive ? "Deactivate job" : "Activate job"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => (isActive ? onDeactivate(job) : onActivate(job))}
          aria-label={isActive ? "Deactivate job" : "Activate job"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit job">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(job)}
          aria-label="Edit job"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Archive job">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onArchive(job)}
          aria-label="Archive job"
          className={`${iconButtonClass} text-red-800`}
        >
          <Archive className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
