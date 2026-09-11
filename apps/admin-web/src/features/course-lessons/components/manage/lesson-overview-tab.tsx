"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  FileQuestion,
  FileText,
  Hash,
  Layers,
  Lock,
  Radio,
  Video,
} from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

import { LessonPreviewAccessBadge } from "@/src/features/course-lessons/components/lesson-preview-access-badge";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type {
  ModuleQuizRow,
  ModuleResourceRow,
} from "@/src/features/course-modules/hooks/use-module-content-data";
import {
  formatLessonOrderLabel,
  formatModuleOrderLabel,
} from "@/src/features/course-lessons/utils/lesson-order.utils";

interface Props {
  module: CourseModule;
  lesson: CourseLesson;
  lessonPosition: number;
  resources: ModuleResourceRow[];
  quizzes: ModuleQuizRow[];
  selfPacedCount: number;
  liveRecordedCount: number;
}

interface SummaryMetric {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-2.5">
        <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconClass: string;
  bgClass: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            bgClass,
          )}
        >
          <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <div className="mt-1 text-sm font-medium text-[#102A56]">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function LessonOverviewTab({
  module,
  lesson,
  lessonPosition,
  resources,
  quizzes,
  selfPacedCount,
  liveRecordedCount,
}: Props) {
  const metrics: SummaryMetric[] = [
    {
      key: "self-paced",
      label: "Self-Paced Videos",
      value: selfPacedCount,
      icon: Video,
      iconClass: "text-sky-600",
      iconBgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    },
    {
      key: "live",
      label: "Live Recorded Videos",
      value: liveRecordedCount,
      icon: Radio,
      iconClass: "text-rose-600",
      iconBgClass: "bg-rose-50/90 ring-rose-100/80",
      cardClass:
        "border-rose-200/70 bg-gradient-to-br from-rose-50/50 via-[#FFF7F8] to-[#FFF1F3]",
    },
    {
      key: "resources",
      label: "Resources",
      value: resources.length,
      icon: FileText,
      iconClass: "text-amber-700",
      iconBgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      value: quizzes.length,
      icon: FileQuestion,
      iconClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "assignments",
      label: "Assignments",
      value: 0,
      icon: ClipboardList,
      iconClass: "text-violet-600",
      iconBgClass: "bg-violet-50/90 ring-violet-100/80",
      cardClass:
        "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
    },
  ];

  const description = lesson.description?.trim() || null;

  return (
    <div className="space-y-3">
      <SectionCard
        title="Parent Module"
        description="Module this lesson belongs to."
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <InfoBlock
            label="Module Name"
            value={module.title}
            icon={Layers}
            iconClass="text-[#2563EB]"
            bgClass="bg-blue-50"
          />
          <InfoBlock
            label="Module Number"
            value={formatModuleOrderLabel(module.displayOrder)}
            icon={Hash}
            iconClass="text-violet-600"
            bgClass="bg-violet-50"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Lesson Information"
        description="Core lesson details and preview access."
      >
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <InfoBlock
            label="Title"
            value={lesson.title}
            icon={BookOpen}
            iconClass="text-[#2563EB]"
            bgClass="bg-blue-50"
          />
          <InfoBlock
            label="Lesson Number"
            value={formatLessonOrderLabel(lessonPosition)}
            icon={Hash}
            iconClass="text-violet-600"
            bgClass="bg-violet-50"
          />
          <InfoBlock
            label="Preview Access"
            value={<LessonPreviewAccessBadge isPreview={lesson.isPreview} />}
            icon={Lock}
            iconClass="text-[#526581]"
            bgClass="bg-[#EFF4FA]"
          />
        </div>

        <div className="border-t border-[#E8F0FA] px-4 py-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Description
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-700">
            {description || "—"}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Content Summary">
        <div className="p-4 pt-3">
          <div className="-mx-0.5 overflow-x-auto pb-0.5">
            <div className="flex w-full min-w-[48rem] flex-nowrap items-stretch gap-2.5">
              {metrics.map((metric) => {
                const Icon = metric.icon;

                return (
                  <div
                    key={metric.key}
                    className={cn(
                      METRIC_CARD_HEIGHT,
                      "min-w-[9.5rem] flex-1 shrink-0 rounded-xl border p-3 shadow-sm",
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
        </div>
      </SectionCard>
    </div>
  );
}
