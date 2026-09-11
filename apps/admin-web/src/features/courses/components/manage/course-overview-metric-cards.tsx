"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileQuestion,
  FileText,
  Layers,
  Radio,
  Video,
} from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { CourseContentStats } from "@/src/features/courses/utils/course-content-stats.util";

interface SummaryMetric {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}

interface Props {
  stats: CourseContentStats;
  isLoading?: boolean;
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

export function CourseOverviewMetricCards({ stats, isLoading }: Props) {
  const metrics: SummaryMetric[] = [
    {
      key: "modules",
      label: "Total Modules",
      value: stats.modules,
      icon: Layers,
      iconClass: "text-[#2563EB]",
      iconBgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "lessons",
      label: "Total Lessons",
      value: stats.lessons,
      icon: BookOpen,
      iconClass: "text-violet-600",
      iconBgClass: "bg-violet-50/90 ring-violet-100/80",
      cardClass:
        "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
    },
    {
      key: "resources",
      label: "Total Resources",
      value: stats.resources,
      icon: FileText,
      iconClass: "text-amber-700",
      iconBgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "live-videos",
      label: "Live Videos",
      value: stats.liveRecordedVideos,
      icon: Radio,
      iconClass: "text-rose-600",
      iconBgClass: "bg-rose-50/90 ring-rose-100/80",
      cardClass:
        "border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-[#FFF7F8] to-[#FFF1F3]",
    },
    {
      key: "recorded-videos",
      label: "Recorded Videos",
      value: stats.selfPacedVideos,
      icon: Video,
      iconClass: "text-sky-600",
      iconBgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      value: stats.quizzes,
      icon: FileQuestion,
      iconClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
  ];

  const rowClassName =
    "flex w-full min-w-[56rem] flex-nowrap items-stretch gap-2.5";

  if (isLoading) {
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

  return (
    <div className="-mx-0.5 overflow-x-auto pb-0.5">
      <div className={rowClassName}>
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.key}
              className={cn(
                METRIC_CARD_HEIGHT,
                "min-w-[9.5rem] flex-1 shrink-0 rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md",
                metric.cardClass,
              )}
            >
              <div className="flex h-full items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    {metric.label}
                  </p>
                  <p className="mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight text-[#102A56]">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
                    metric.iconBgClass,
                  )}
                >
                  <Icon className={cn("h-4 w-4", metric.iconClass)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
