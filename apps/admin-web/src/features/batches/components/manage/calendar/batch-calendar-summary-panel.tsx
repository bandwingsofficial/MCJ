"use client";

import type { BatchCalendarSummary } from "@/src/features/batches/types/batch.types";
import { batchCalendarSummaryMetrics } from "@/src/features/batches/utils/batch-calendar-display.utils";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  summary: BatchCalendarSummary;
  modeLabel?: string;
}

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

export function BatchCalendarSummaryPanel({ summary, modeLabel }: Props) {
  const metrics = batchCalendarSummaryMetrics(summary);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h2 className="text-base font-semibold text-[#102A56]">
            Calendar Summary
          </h2>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            {modeLabel
              ? `${modeLabel} totals from the saved batch calendar configuration.`
              : "Totals from the saved batch calendar configuration."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
          {metrics.map(({ key, label, value, icon: Icon, iconClass, iconBgClass, cardClass }) => (
            <div
              key={key}
              className={cn(
                METRIC_CARD_HEIGHT,
                "rounded-xl border p-3 shadow-sm",
                cardClass,
              )}
            >
              <div className="flex h-full items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-[#647A9B]">
                    {label}
                  </p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight text-[#102A56]">
                    {value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                    iconBgClass,
                  )}
                >
                  <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
          Day Type Legend
        </h3>
        <ul className="mt-3 space-y-2">
          {[
            { label: "Working Day", swatch: "bg-emerald-100 ring-emerald-200/80" },
            { label: "Sunday", swatch: "bg-violet-100 ring-violet-200/80" },
            { label: "Holiday", swatch: "bg-amber-100 ring-amber-200/80" },
            { label: "Non-Working Day", swatch: "bg-slate-200 ring-slate-300/80" },
            { label: "Outside Period", swatch: "bg-slate-100 ring-slate-200/80" },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-xs text-[#647A9B]">
              <span
                className={cn(
                  "h-4 w-4 shrink-0 rounded-md ring-1",
                  item.swatch,
                )}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-[#647A9B]">
          Upcoming working days within the batch period use a lighter blue tint.
          Completed/passed counts exclude future dates.
        </p>
      </div>
    </div>
  );
}
