"use client";

import { useState } from "react";

import { CHART_PALETTE } from "@/src/features/dashboard/components/chart/chart-utils";
import { formatCount } from "@/src/features/dashboard/utils/dashboard-date.utils";

export interface HorizontalBarItem {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  items: HorizontalBarItem[];
  legendLabel: string;
  valueLabel?: string;
  emptyLabel?: string;
  maxItems?: number;
}

export function DashboardHorizontalBarChart({
  items,
  legendLabel,
  valueLabel = "Count",
  emptyLabel = "No records yet.",
  maxItems = 8,
}: Props) {
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const visible = items.slice(0, maxItems);
  if (!visible.length) {
    return (
      <p className="py-6 text-center text-sm text-[#647A9B]">{emptyLabel}</p>
    );
  }

  const max = Math.max(1, ...visible.map((item) => item.value));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-[#647A9B]">
        <span className="font-medium text-[#647A9B]">{legendLabel}</span>
        <span className="uppercase tracking-wide">{valueLabel}</span>
      </div>
      <div className="space-y-3 rounded-xl bg-gradient-to-r from-[#F8FBFF]/60 to-transparent p-2">
        {visible.map((item, index) => {
          const width = Math.max(4, (item.value / max) * 100);
          const color =
            item.color ?? CHART_PALETTE[index % CHART_PALETTE.length];
          const active = hoverLabel === null || hoverLabel === item.label;
          return (
            <div
              key={item.label}
              onMouseEnter={() => setHoverLabel(item.label)}
              onMouseLeave={() => setHoverLabel(null)}
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span
                  className="truncate font-medium text-[#102A56]"
                  title={item.label}
                >
                  {item.label}
                </span>
                <span className="shrink-0 tabular-nums font-semibold text-[#647A9B]">
                  {formatCount(item.value)}
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-[#EEF2F8]">
                <div
                  className="h-full rounded-full transition-opacity duration-150"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${color}99, ${color})`,
                    opacity: active ? 1 : 0.4,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
