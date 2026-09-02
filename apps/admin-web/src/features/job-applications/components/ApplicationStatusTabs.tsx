"use client";

import type { ApplicationStatusCounts } from "@/src/features/job-applications/hooks/useJobApplications";
import type { OnboardingStatusFilter } from "@/src/features/job-applications/types/job-application.types";

interface ApplicationStatusTabsProps {
  activeStatus: OnboardingStatusFilter;
  counts: ApplicationStatusCounts;
  disabled?: boolean;
  onChange: (status: OnboardingStatusFilter) => void;
}

export function ApplicationStatusTabs({
  activeStatus,
  counts,
  disabled = false,
  onChange,
}: ApplicationStatusTabsProps) {
  const tabs: {
    value: OnboardingStatusFilter;
    label: string;
    count: number;
  }[] = [
    { value: "PENDING", label: "Pending", count: counts.pending },
    { value: "ACCEPTED", label: "Approved", count: counts.approved },
    { value: "REJECTED", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.value;

        return (
          <button
            key={tab.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-[#2563EB] bg-[#F4F9FF] text-[#2563EB]"
                : "border-[#DCE8F5] bg-white text-[#647A9B] hover:bg-[#F8FBFF] hover:text-[#102A56]"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                isActive
                  ? "bg-[#2563EB] text-white"
                  : "bg-[#F4F9FF] text-[#647A9B]"
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
