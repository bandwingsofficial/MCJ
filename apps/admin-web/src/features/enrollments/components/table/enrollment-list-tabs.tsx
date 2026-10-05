"use client";

import type { AdminEnrollmentListTab } from "@mcj/shared-constants";

import { cn } from "@/src/shared/lib/cn";

interface EnrollmentListTabsProps {
  activeTab: AdminEnrollmentListTab;
  onChange: (tab: AdminEnrollmentListTab) => void;
}

export function EnrollmentListTabs({
  activeTab,
  onChange,
}: EnrollmentListTabsProps) {
  const tabs: Array<{
    id: AdminEnrollmentListTab;
    label: string;
  }> = [
    {
      id: "active",
      label: "Advanced / Admitted",
    },
    {
      id: "completed",
      label: "Completed",
    },
    {
      id: "cancelled",
      label: "Cancelled",
    },
  ];

  return (
    <div
      role="tablist"
      aria-label="Enrolment lifecycle tabs"
      className="flex flex-wrap gap-2 border-b border-[#E1EBF5] px-1 pb-2"
    >
      {tabs.map((tab) => {
        const selected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-[#2563EB] text-white shadow-sm"
                : "bg-white text-[#647A9B] ring-1 ring-[#DCE8F5] hover:bg-[#F8FBFF]",
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
