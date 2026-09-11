"use client";

import type { LucideIcon } from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

export interface OverviewMetricItem {
  key: string;
  label: string;
  hint: string;
  value: string | number;
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  cardClass: string;
  isText?: boolean;
}

interface Props {
  metrics: OverviewMetricItem[];
  isLoading?: boolean;
  layout?: "scroll" | "grid-four";
}

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

function MetricCardSkeleton() {
  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "min-w-[9.5rem] flex-1 shrink-0 rounded-xl border border-[#E1EBF5] bg-gradient-to-br from-[#F8FBFF] to-white p-3 shadow-sm",
      )}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-6 w-10" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: OverviewMetricItem }) {
  const Icon = metric.icon;

  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "min-w-0 flex-1 rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md",
        metric.cardClass,
      )}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {metric.label}
          </p>
          <p
            className={cn(
              "mt-0.5 font-semibold tabular-nums leading-none tracking-tight text-[#102A56]",
              metric.isText ? "text-lg" : "text-2xl",
            )}
          >
            {metric.value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
            metric.bgClass,
          )}
        >
          <Icon className={cn("h-4 w-4", metric.iconClass)} />
        </div>
      </div>
    </div>
  );
}

export function StudentOverviewMetricGrid({
  metrics,
  isLoading,
  layout = "scroll",
}: Props) {
  const rowClassName =
    "flex w-full min-w-[56rem] flex-nowrap items-stretch gap-2.5";
  const gridClassName =
    "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4";

  if (isLoading) {
    if (layout === "grid-four") {
      return (
        <div className={gridClassName}>
          {metrics.map((metric) => (
            <MetricCardSkeleton key={metric.key} />
          ))}
        </div>
      );
    }

    return (
      <div className="-mx-0.5 overflow-x-auto pb-0.5">
        <div className={rowClassName}>
          {metrics.map((metric) => (
            <MetricCardSkeleton key={metric.key} />
          ))}
        </div>
      </div>
    );
  }

  if (layout === "grid-four") {
    return (
      <div className={gridClassName}>
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    );
  }

  return (
    <div className="-mx-0.5 overflow-x-auto pb-0.5">
      <div className={rowClassName}>
        {metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </div>
  );
}
