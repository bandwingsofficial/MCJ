"use client";

import { cn } from "@/src/shared/lib/cn";

import type { CourseTabStatus } from "@/src/features/learning/utils/course-status.utils";

const TABS: Array<{ id: CourseTabStatus; label: string }> = [
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "upcoming", label: "Upcoming" },
];

interface LearningStatusTabsProps {
  activeTab: CourseTabStatus;
  counts: Record<CourseTabStatus, number>;
  onChange: (tab: CourseTabStatus) => void;
}

export function LearningStatusTabs({
  activeTab,
  counts,
  onChange,
}: LearningStatusTabsProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-6 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative shrink-0 pb-3 text-sm font-medium transition-colors",
                isActive ? "text-[#0B1F3A]" : "text-slate-500 hover:text-slate-700",
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-slate-400">({counts[tab.id]})</span>
              {isActive ? (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#2563EB]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
