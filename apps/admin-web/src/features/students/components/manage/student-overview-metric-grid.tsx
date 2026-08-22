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
  isText?: boolean;
}

interface Props {
  metrics: OverviewMetricItem[];
  isLoading?: boolean;
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

export function StudentOverviewMetricGrid({ metrics, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCardSkeleton key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.key}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p
                  className={cn(
                    "mt-1 font-semibold tabular-nums tracking-tight text-slate-900",
                    metric.isText ? "text-lg" : "text-3xl",
                  )}
                >
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{metric.hint}</p>
              </div>
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  metric.bgClass,
                )}
              >
                <Icon className={cn("h-5 w-5", metric.iconClass)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
