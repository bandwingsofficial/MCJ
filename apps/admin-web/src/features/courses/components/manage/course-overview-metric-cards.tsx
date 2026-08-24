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
  bgClass: string;
}

interface Props {
  stats: CourseContentStats;
  isLoading?: boolean;
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-14" />
        </div>
        <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
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
      iconClass: "text-[#2447A8]",
      bgClass: "bg-blue-50",
    },
    {
      key: "lessons",
      label: "Total Lessons",
      value: stats.lessons,
      icon: BookOpen,
      iconClass: "text-violet-600",
      bgClass: "bg-violet-50",
    },
    {
      key: "resources",
      label: "Total Resources",
      value: stats.resources,
      icon: FileText,
      iconClass: "text-amber-600",
      bgClass: "bg-amber-50",
    },
    {
      key: "live-videos",
      label: "Live Videos",
      value: stats.liveRecordedVideos,
      icon: Radio,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
    },
    {
      key: "recorded-videos",
      label: "Recorded Videos",
      value: stats.selfPacedVideos,
      icon: Video,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      value: stats.quizzes,
      icon: FileQuestion,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
  ];

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
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {metric.value}
                </p>
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
