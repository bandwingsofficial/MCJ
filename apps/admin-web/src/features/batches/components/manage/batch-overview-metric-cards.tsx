"use client";

import type { LucideIcon } from "lucide-react";
import {
  Layers,
  MonitorPlay,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { BatchAggregateStats } from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchEnrollmentCapacityLabel } from "@/src/features/batches/utils/batch-timing.utils";
import type { Batch } from "@/src/features/batches/types/batch.types";

interface Props {
  batch: Batch;
  aggregateStats: BatchAggregateStats;
  configuredModesCount: number;
  trainerCount?: number | null;
  isLoading?: boolean;
}

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

function MetricCardSkeleton() {
  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "w-full rounded-xl border border-[#E1EBF5] bg-gradient-to-br from-[#F8FBFF] to-white p-3 shadow-sm",
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

function MetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
  iconBgClass,
  cardClass,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}) {
  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "w-full rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md",
        cardClass,
      )}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
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
  );
}

export function BatchOverviewMetricCards({
  batch,
  aggregateStats,
  configuredModesCount,
  trainerCount,
  isLoading = false,
}: Props) {
  const enrollmentLabel = formatBatchEnrollmentCapacityLabel(batch);
  const hasTimings = aggregateStats.totalTimings > 0;

  const metrics = [
    {
      key: "timings",
      label: "Batch Timings",
      value: hasTimings ? aggregateStats.totalTimings : "—",
      icon: Layers,
      iconClass: "text-[#2563EB]",
      iconBgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "enrollment",
      label: "Enrolled / Capacity",
      value: enrollmentLabel,
      icon: Users,
      iconClass: "text-violet-600",
      iconBgClass: "bg-violet-50/90 ring-violet-100/80",
      cardClass:
        "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
    },
    {
      key: "available",
      label: "Available Seats",
      value: hasTimings ? aggregateStats.totalAvailableSeats : "—",
      icon: UserCheck,
      iconClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "modes",
      label: "Learning Modes",
      value: configuredModesCount > 0 ? configuredModesCount : "—",
      icon: MonitorPlay,
      iconClass: "text-amber-700",
      iconBgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "trainers",
      label: "Trainers",
      value: trainerCount ?? "—",
      icon: UserRound,
      iconClass: "text-sky-600",
      iconBgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCardSkeleton key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
      {metrics.map(({ key, ...metric }) => (
        <MetricCard key={key} {...metric} />
      ))}
    </div>
  );
}
