"use client";

import { useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { CourseDetails } from "@/src/features/courses/types/course.types";
import type { CourseSummary } from "@/src/features/courses/types/course.types";
import { computeCourseContentStats } from "@/src/features/courses/utils/course-content-stats.util";

import { CourseOverviewSummary } from "./course-overview-summary";
import { CourseManageModulesPanel } from "./course-manage-modules-panel";
import { CourseManagePreviewPanel } from "./course-manage-preview-panel";

interface Props {
  course: CourseDetails;
  summary: CourseSummary | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onCourseUpdated: (course: CourseDetails) => void;
  onTabChange?: (tab: TabKey) => void;
}

export type TabKey = "overview" | "modules" | "preview";

function formatDuration(
  duration: number | null,
  durationType: CourseDetails["durationType"],
) {
  if (!duration || !durationType) {
    return "—";
  }
  const unit = durationType.toLowerCase();
  return `${duration} ${unit}`;
}

function formatCourseType(course: CourseDetails) {
  if (course.modes?.length) {
    return course.modes.join(", ");
  }
  return course.mode ?? "—";
}

export function CourseManageWorkspace({
  course,
  summary,
  summaryLoading = false,
  onSummaryRefresh,
  onTabChange,
}: Props) {
  const courseId = course.id;
  const isArchived = Boolean(course.deletedAt || course.isDeleted);
  const contentDisabled = isArchived || course.status === "ARCHIVED";

  const [tab, setTab] = useState<TabKey>("overview");

  const categoryName =
    course.categoryName?.trim() || course.categoryId || "—";

  const contentStats = useMemo(
    () => computeCourseContentStats(course, summary),
    [course, summary],
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as TabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {(
          [
            ["overview", "Overview"],
            ["modules", "Modules"],
            ["preview", "Preview"],
          ] as const
        ).map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2447A8] data-[state=active]:bg-transparent data-[state=active]:text-[#2447A8] data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Course Information
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Course Code</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {course.slug}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Course Name</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {course.title}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Category</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {categoryName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Type</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {formatCourseType(course)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Duration</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {formatDuration(course.duration, course.durationType)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="mt-0.5 text-sm font-medium text-slate-900">
                {course.status}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate-500">Description</dt>
              <dd className="mt-0.5 text-sm text-slate-800">
                {course.description?.trim() ||
                  course.shortDescription?.trim() ||
                  "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <CourseOverviewSummary
          stats={contentStats}
          isLoading={summaryLoading}
        />
      </TabsContent>

      <TabsContent value="modules">
        <CourseManageModulesPanel
          courseId={courseId}
          course={course}
          disabled={contentDisabled}
          onRefresh={onSummaryRefresh}
        />
      </TabsContent>

      <TabsContent value="preview">
        <CourseManagePreviewPanel
          courseId={courseId}
          courseTitle={course.title}
        />
      </TabsContent>
    </Tabs>
  );
}
