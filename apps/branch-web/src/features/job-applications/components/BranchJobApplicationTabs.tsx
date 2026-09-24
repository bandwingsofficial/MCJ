"use client";

import type { JobApplicationScheduleCounts } from "@/src/features/branch-ops/types";
import type { JobApplicationScheduleTab } from "@/src/features/job-applications/constants/job-application.constants";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  counts: JobApplicationScheduleCounts;
  activeTab: JobApplicationScheduleTab;
  disabled?: boolean;
  onChange: (tab: JobApplicationScheduleTab) => void;
}

const TABS: Array<{
  value: JobApplicationScheduleTab;
  label: string;
  countKey: keyof JobApplicationScheduleCounts;
}> = [
  { value: "NOT_SCHEDULED", label: "Not Scheduled", countKey: "notScheduled" },
  { value: "SCHEDULED", label: "Scheduled", countKey: "scheduled" },
  { value: "ALL", label: "All Applications", countKey: "all" },
];

export function BranchJobApplicationTabs({
  counts,
  activeTab,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]"
                : "border-[#DCE8F5] bg-white text-[#526581] hover:bg-[#F8FBFF]",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                active ? "bg-white text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#647A9B]",
              )}
            >
              {counts[tab.countKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
