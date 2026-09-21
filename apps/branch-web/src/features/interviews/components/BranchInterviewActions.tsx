"use client";

import { CalendarClock, ClipboardCheck, Eye } from "lucide-react";

import type { InterviewItem } from "@/src/features/branch-ops/types";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  interview: InterviewItem;
  disabled?: boolean;
  onView: (interview: InterviewItem) => void;
  onManage: (interview: InterviewItem) => void;
  onRecordResult: (interview: InterviewItem) => void;
}

export function BranchInterviewActions({
  interview,
  disabled = false,
  onView,
  onManage,
  onRecordResult,
}: Props) {
  const canManage =
    interview.status === "SCHEDULED" || interview.status === "ASSIGNED";
  const canRecordResult = interview.status === "SCHEDULED";

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="View">
        <button
          type="button"
          disabled={disabled}
          aria-label="View interview"
          className={`${iconButtonClass} text-blue-900`}
          onClick={() => onView(interview)}
        >
          <Eye className={iconClass} />
        </button>
      </Tooltip>

      {canRecordResult ? (
        <Tooltip content="Record Result">
          <button
            type="button"
            disabled={disabled}
            aria-label="Record interview result"
            className={`${iconButtonClass} text-emerald-800`}
            onClick={() => onRecordResult(interview)}
          >
            <ClipboardCheck className={iconClass} />
          </button>
        </Tooltip>
      ) : null}

      {canManage ? (
        <Tooltip
          content={
            interview.status === "ASSIGNED"
              ? "Schedule Interview"
              : "Manage Interview"
          }
        >
          <button
            type="button"
            disabled={disabled}
            aria-label="Manage interview schedule"
            className={`${iconButtonClass} text-indigo-800`}
            onClick={() => onManage(interview)}
          >
            <CalendarClock className={iconClass} />
          </button>
        </Tooltip>
      ) : null}
    </div>
  );
}
