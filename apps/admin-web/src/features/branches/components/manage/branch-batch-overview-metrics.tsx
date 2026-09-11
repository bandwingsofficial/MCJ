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
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "totalBatches",
    label: "Total Batches",
    icon: Layers,
    iconClass: "text-[#2563EB]",
    iconBgClass: "bg-blue-50/90 ring-blue-100/80",
    cardClass:
      "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
  },
  {
    key: "totalStudents",
    label: "Total Students",
    icon: Users,
    iconClass: "text-emerald-600",
    iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
    cardClass:
      "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
  },
  {
    key: "offlineBatches",
    label: "Offline / Classroom",
    icon: School,
    iconClass: "text-violet-600",
    iconBgClass: "bg-violet-50/90 ring-violet-100/80",
    cardClass:
      "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
  },
  {
    key: "onlineBatches",
    label: "Online Batches",
    icon: Monitor,
    iconClass: "text-sky-600",
    iconBgClass: "bg-sky-50/90 ring-sky-100/80",
    cardClass:
      "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
  },
  {
    key: "recordedBatches",
    label: "Self-Paced / Recorded",
    icon: PlayCircle,
    iconClass: "text-amber-700",
    iconBgClass: "bg-amber-50/90 ring-amber-100/80",
    cardClass:
      "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
  },
  {
    key: "activeUpcomingBatches",
    label: "Active / Upcoming",
    icon: CalendarClock,
    iconClass: "text-indigo-600",
    iconBgClass: "bg-indigo-50/90 ring-indigo-100/80",
    cardClass:
      "border-indigo-200/70 bg-gradient-to-br from-indigo-50/50 via-[#F7F8FF] to-[#EEF2FF]",
  },
  {
    key: "ongoingBatches",
    label: "Ongoing Batches",
    icon: Activity,
    iconClass: "text-teal-600",
    iconBgClass: "bg-teal-50/90 ring-teal-100/80",
    cardClass:
      "border-teal-200/70 bg-gradient-to-br from-teal-50/50 via-[#F6FDFA] to-[#EDFAF7]",
  },
  {
    key: "expiredBatches",
    label: "Expired Batches",
    icon: History,
    iconClass: "text-slate-600",
    iconBgClass: "bg-slate-100/90 ring-slate-200/80",
    cardClass:
      "border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/80",
  },
];

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

interface Props {
  stats: BranchBatchOverviewStats;
  isLoading?: boolean;
}

function MetricCardSkeleton() {
  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "rounded-xl border border-[#E1EBF5] bg-gradient-to-br from-[#F8FBFF] to-white p-3 shadow-sm",
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

export function BranchBatchOverviewMetrics({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCardSkeleton key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
      {METRICS.map((metric) => {
        const Icon = metric.icon;

        return (
          <div
            key={metric.key}
            className={cn(
              METRIC_CARD_HEIGHT,
              "rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md",
              metric.cardClass,
            )}
          >
            <div className="flex h-full items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight text-[#102A56]">
                  {stats[metric.key]}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                  metric.iconBgClass,
                )}
              >
                <Icon className={cn("h-4 w-4", metric.iconClass)} aria-hidden="true" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
