"use client";

import { cn } from "@/src/shared/lib/cn";

export type BranchLiveRecordedLifecycleTab = "ONGOING" | "EXPIRED";

const TABS: { label: string; value: BranchLiveRecordedLifecycleTab }[] = [
  { label: "Ongoing", value: "ONGOING" },
  { label: "Expired", value: "EXPIRED" },
];

interface Props {
  value: BranchLiveRecordedLifecycleTab;
  counts: Record<BranchLiveRecordedLifecycleTab, number>;
  onChange: (value: BranchLiveRecordedLifecycleTab) => void;
  disabled?: boolean;
}

export function BranchLiveRecordedLifecycleTabs({
  value,
  counts,
  onChange,
  disabled,
}: Props) {
  return (
    <div
      className="flex h-auto w-full flex-wrap justify-start gap-0.5 border-b border-slate-200"
      role="tablist"
      aria-label="Batch status for live recorded videos"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.value;

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
              ({counts[tab.value]})
            </span>
          </button>
        );
      })}
    </div>
  );
}
