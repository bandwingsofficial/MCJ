"use client";

import type { BatchDateLifecycleTab } from "@/src/features/branch-ops/utils/batch-selection.utils";
import { cn } from "@/src/shared/lib/cn";

export interface BatchLifecycleTabCounts {
  upcoming: number;
  ongoing: number;
  expired: number;
}

interface Props {
  counts: BatchLifecycleTabCounts;
  activeTab: BatchDateLifecycleTab;
  disabled?: boolean;
  onChange: (tab: BatchDateLifecycleTab) => void;
}

const TABS: Array<{
  value: BatchDateLifecycleTab;
  label: string;
  countKey: keyof BatchLifecycleTabCounts;
}> = [
  { value: "UPCOMING", label: "Upcoming", countKey: "upcoming" },
  { value: "ONGOING", label: "Ongoing", countKey: "ongoing" },
  { value: "EXPIRED", label: "Expired", countKey: "expired" },
];

export function BatchLifecycleTabs({
  counts,
  activeTab,
  disabled = false,
  onChange,
}: Props) {
  return (
    <div
      className="flex h-auto w-full flex-wrap justify-start gap-0.5 border-b border-slate-200"
      role="tablist"
      aria-label="Batch date status"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        const count = counts[tab.countKey];

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-none border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-500 hover:text-[#102A56]",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {tab.label}
            <span className="ml-1.5 tabular-nums text-xs font-semibold opacity-80">
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
