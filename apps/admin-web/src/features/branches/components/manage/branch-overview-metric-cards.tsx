"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  Grid3x3,
  Users,
  UserSquare2,
} from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";

interface MetricConfig {
  key: keyof Omit<BranchSummaryCounts, "branchId">;
  label: string;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "enrollments",
    label: "Students Enrolled",
    hint: "Active enrollments",
    icon: Users,
    iconClass: "text-violet-600",
    bgClass: "bg-violet-50",
  },
  {
    key: "courses",
    label: "Courses",
    hint: "Active courses",
    icon: BookOpen,
    iconClass: "text-[#2447A8]",
    bgClass: "bg-blue-50",
  },
  {
    key: "batches",
    label: "Batches",
    hint: "Upcoming & Running",
    icon: CalendarDays,
    iconClass: "text-orange-600",
    bgClass: "bg-orange-50",
  },
  {
    key: "categories",
    label: "Categories",
    hint: "Active categories",
    icon: Grid3x3,
    iconClass: "text-rose-600",
    bgClass: "bg-rose-50",
  },
  {
    key: "instructors",
    label: "Trainers",
    hint: "Assigned trainers",
    icon: UserSquare2,
    iconClass: "text-sky-600",
    bgClass: "bg-sky-50",
  },
];

interface Props {
  summary: BranchSummaryCounts | null;
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

export function BranchOverviewMetricCards({ summary, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {METRICS.map((metric) => (
          <MetricCardSkeleton key={metric.key} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        const value = summary?.[metric.key] ?? 0;

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
                <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                  {value}
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
