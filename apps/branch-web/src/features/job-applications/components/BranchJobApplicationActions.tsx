"use client";

import { CalendarClock, Eye } from "lucide-react";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { isInterviewScheduled } from "@/src/features/job-applications/utils/job-application-display.utils";
import {
  isJobApplicationScheduleBlocked,
  resolveJobApplicationListPresentation,
} from "@/src/features/job-applications/utils/job-application-workflow.utils";
import { useLifecycleNow } from "@/src/features/branch-interview-lifecycle/use-lifecycle-now";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  application: JobApplicationItem;
  disabled?: boolean;
  onView: (application: JobApplicationItem) => void;
  onSchedule: (application: JobApplicationItem) => void;
}

export function BranchJobApplicationActions({
  application,
  disabled = false,
  onView,
  onSchedule,
}: Props) {
  const nowMs = useLifecycleNow();
  const scheduled = isInterviewScheduled(application.latestInterview);
  const scheduleBlocked = isJobApplicationScheduleBlocked(application, nowMs);
  const presentation = resolveJobApplicationListPresentation(application, nowMs);
  const scheduleLabel =
    presentation.scheduleActionLabel ??
    (scheduled ? "Manage Interview" : "Schedule Interview");

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Tooltip content="View">
        <button
          type="button"
          disabled={disabled}
          aria-label="View application"
          className={`${iconButtonClass} text-blue-900`}
          onClick={() => onView(application)}
        >
          <Eye className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip
        content={
          scheduleBlocked
            ? "Interview scheduling is not available for this application"
            : scheduleLabel
        }
      >
        <button
          type="button"
          disabled={disabled || scheduleBlocked}
          aria-label={
            scheduleBlocked ? "Interview scheduling unavailable" : scheduleLabel
          }
          className={`${iconButtonClass} text-indigo-800`}
          onClick={() => onSchedule(application)}
        >
          <CalendarClock className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
