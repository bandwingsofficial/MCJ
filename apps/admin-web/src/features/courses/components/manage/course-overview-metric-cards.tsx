"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  FileQuestion,
  GraduationCap,
  Users,
} from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { CourseSummary } from "@/src/features/courses/types/course.types";

interface SummaryMetric {
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
  summary: CourseSummary | null;
  enrollmentCount: number;
  pricingLabel: string;
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

export function CourseOverviewMetricCards({
  summary,
  enrollmentCount,
  pricingLabel,
  isLoading,
}: Props) {
  const metrics: SummaryMetric[] = [
    {
      key: "batches",
      label: "Batches",
      hint: "Total batches",
      value: summary?.batches ?? 0,
      icon: CalendarDays,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-50",
    },
    {
      key: "students",
      label: "Students",
      hint: "Enrolled students",
      value: summary?.students ?? 0,
      icon: Users,
      iconClass: "text-violet-600",
      bgClass: "bg-violet-50",
    },
    {
      key: "enrollments",
      label: "Enrollments",
      hint: "Total enrollments",
      value: enrollmentCount,
      icon: GraduationCap,
      iconClass: "text-emerald-600",
      bgClass: "bg-emerald-50",
    },
    {
      key: "modules",
      label: "Modules",
      hint: "Course modules",
      value: summary?.modules ?? 0,
      icon: BookOpen,
      iconClass: "text-[#2447A8]",
      bgClass: "bg-blue-50",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      hint: "Assessment quizzes",
      value: summary?.quizzes ?? 0,
      icon: FileQuestion,
      iconClass: "text-sky-600",
      bgClass: "bg-sky-50",
    },
    {
      key: "course-fee",
      label: "Course Fee",
      hint: "Default enrollment fee",
      value: pricingLabel,
      icon: CreditCard,
      iconClass: "text-rose-600",
      bgClass: "bg-rose-50",
      isText: true,
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
