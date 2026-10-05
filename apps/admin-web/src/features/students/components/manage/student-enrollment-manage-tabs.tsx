"use client";

import type { StudentManageEnrollmentTab } from "@mcj/shared-constants";

import { cn } from "@/src/shared/lib/cn";

interface Props {
  activeTab: StudentManageEnrollmentTab;
  onChange: (tab: StudentManageEnrollmentTab) => void;
}

const TABS: Array<{ id: StudentManageEnrollmentTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Advanced / Admitted" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function StudentEnrollmentManageTabs({
  activeTab,
  onChange,
}: Props) {
  return (
    <div
      role="tablist"
      aria-label="Student enrollment history tabs"
      className="flex flex-wrap gap-2 border-b border-slate-200 pb-2"
    >
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selected
                ? "bg-[#2563EB] text-white"
                : "bg-white text-[#647A9B] ring-1 ring-[#DCE8F5] hover:bg-slate-50",
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
