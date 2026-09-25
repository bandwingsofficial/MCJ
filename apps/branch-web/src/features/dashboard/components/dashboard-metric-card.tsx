"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";
import type { DashboardMetric } from "@/src/features/dashboard/types/branch-dashboard.types";
import { formatCount, formatInr } from "@/src/features/dashboard/utils/dashboard-date.utils";
import {
  comparisonToneClass,
  formatMetricComparisonLabel,
} from "@/src/features/dashboard/utils/metric-comparison.utils";

interface Props {
  label: string;
  metric: DashboardMetric;
  icon: LucideIcon;
  gradient: string;
  href?: string;
  format?: "count" | "currency";
}

export function DashboardMetricCard({
  label,
  metric,
  icon: Icon,
  gradient,
  href,
  format = "count",
}: Props) {
  const display =
    format === "currency"
      ? formatInr(metric.value)
      : formatCount(metric.value);

  const comparisonLabel = formatMetricComparisonLabel(metric, format);

  const body = (
    <div
      className={cn(
        "relative flex h-full min-h-[118px] flex-col overflow-hidden rounded-2xl border border-[#E8EEF5]/90 p-4 shadow-sm",
        gradient,
      )}
    >
      <div className="flex flex-1 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <p
            className="mt-1 truncate text-xl font-bold tabular-nums tracking-tight text-[#102A56]"
            title={display}
          >
            {display}
          </p>
          <p
            className={cn(
              "mt-1 min-h-[2.25rem] text-xs font-medium leading-snug line-clamp-2",
              comparisonLabel
                ? comparisonToneClass(metric)
                : "invisible",
            )}
            aria-hidden={!comparisonLabel}
          >
            {comparisonLabel ?? "—"}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#2563EB] shadow-sm ring-1 ring-white/60">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full min-w-0 transition-opacity hover:opacity-95"
      >
        {body}
      </Link>
    );
  }

  return <div className="h-full min-w-0">{body}</div>;
}
