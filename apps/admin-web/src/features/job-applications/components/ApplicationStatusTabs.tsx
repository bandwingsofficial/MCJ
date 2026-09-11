"use client";

import type { ApplicationStatusCounts, ApplicationStatusFilter } from "@/src/features/job-applications/hooks/useJobApplications";
import { JOB_APPLICATION_FILTER_ALL } from "@/src/features/job-applications/constants/job-application-filters.constants";

interface ApplicationStatusTabsProps {
  activeStatus: ApplicationStatusFilter;
  counts: ApplicationStatusCounts;
  disabled?: boolean;
  onChange: (status: ApplicationStatusFilter) => void;
}

export function ApplicationStatusTabs({
  activeStatus,
  counts,
  disabled = false,
  onChange,
}: ApplicationStatusTabsProps) {
  const tabs: {
    value: Exclude<ApplicationStatusFilter, typeof JOB_APPLICATION_FILTER_ALL>;
    label: string;
    count: number;
  }[] = [
    { value: "PENDING", label: "Pending", count: counts.pending },
    { value: "ACCEPTED", label: "Approved", count: counts.approved },
    { value: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
      {tabs.map((tab) => {
        const isActive =
          activeStatus !== JOB_APPLICATION_FILTER_ALL &&
          activeStatus === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-2.5 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#647A9B] hover:text-[#102A56]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0 text-[11px] font-semibold tabular-nums leading-5 ${
                isActive
                  ? "bg-[#2563EB]/10 text-[#2563EB]"
                  : "bg-slate-100 text-[#647A9B]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
