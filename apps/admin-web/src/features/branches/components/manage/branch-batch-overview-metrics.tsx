"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarClock,
  History,
  Layers,
  Monitor,
  PlayCircle,
  School,
  Users,
} from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { BranchBatchOverviewStats } from "@/src/features/branches/utils/branch-batch-overview.utils";

interface MetricConfig {
  key: keyof BranchBatchOverviewStats;
  label: string;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "totalBatches",
    label: "Total Batches",
    hint: "Parent batches at this branch",
    icon: Layers,
    iconClass: "text-[#2563EB]",
    bgClass: "bg-blue-50",
  },
  {
    key: "totalStudents",
    label: "Total Students",
    hint: "Across all batch timings",
    icon: Users,
    iconClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
  {
    key: "offlineBatches",
    label: "Offline / Classroom Batches",
    hint: "Parent batches with offline timings",
    icon: School,
    iconClass: "text-violet-600",
    bgClass: "bg-violet-50",
  },
  {
    key: "onlineBatches",
    label: "Online Batches",
    hint: "Parent batches with online timings",
    icon: Monitor,
    iconClass: "text-sky-600",
    bgClass: "bg-sky-50",
  },
  {
    key: "recordedBatches",
    label: "Self-Paced / Pre-Recorded Batches",
    hint: "Parent batches with self-paced timings",
    icon: PlayCircle,
    iconClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  {
    key: "activeUpcomingBatches",
    label: "Active / Upcoming Batches",
    hint: "Scheduled to start",
    icon: CalendarClock,
    iconClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
  {
    key: "ongoingBatches",
    label: "Ongoing Batches",
    hint: "Currently in progress",
    icon: Activity,
    iconClass: "text-teal-600",
    bgClass: "bg-teal-50",
  },
  {
    key: "expiredBatches",
    label: "Expired Batches",
    hint: "Completed or expired",
    icon: History,
    iconClass: "text-slate-600",
    bgClass: "bg-slate-100",
  },
];

interface Props {
  stats: BranchBatchOverviewStats;
  isLoading?: boolean;
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

export function BranchBatchOverviewMetrics({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCardSkeleton key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.key}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-[#102A56]">
                  {stats[metric.key]}
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
