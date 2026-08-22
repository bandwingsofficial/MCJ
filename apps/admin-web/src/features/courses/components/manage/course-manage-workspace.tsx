"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { CourseDetails } from "@/src/features/courses/types/course.types";
import type { CourseSummary } from "@/src/features/courses/types/course.types";
import { COURSE_MANAGE_DEFAULT_TAB } from "@/src/features/courses/utils/course-manage.routes";

import { CourseManageModulesPanel } from "./course-manage-modules-panel";
import { CourseManageOverviewPanel } from "./course-manage-overview-panel";
import { CourseManagePreviewPanel } from "./course-manage-preview-panel";

interface Props {
  course: CourseDetails;
  summary: CourseSummary | null;
  summaryLoading?: boolean;
  overviewRefreshKey?: number;
  activeTab?: TabKey;
  onSummaryRefresh: () => Promise<void>;
  onCourseUpdated: (course: CourseDetails) => void;
  onTabChange?: (tab: TabKey) => void;
  onEditCourse?: () => void;
  onMutationSuccess?: () => Promise<void>;
}

export type TabKey = "overview" | "modules" | "preview";

export function CourseManageWorkspace({
  course,
  summary,
  summaryLoading = false,
  overviewRefreshKey = 0,
  activeTab = COURSE_MANAGE_DEFAULT_TAB,
  onSummaryRefresh,
  onTabChange,
  onEditCourse,
  onMutationSuccess,
}: Props) {
  const courseId = course.id;
  const isArchived = Boolean(course.deletedAt || course.isDeleted);
  const contentDisabled = isArchived || course.status === "ARCHIVED";

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onTabChange?.(value as TabKey);
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

      <TabsContent value="overview">
        <CourseManageOverviewPanel
          course={course}
          summary={summary}
          summaryLoading={summaryLoading}
          refreshKey={overviewRefreshKey}
          onSummaryRefresh={onSummaryRefresh}
          onNavigateToTab={(nextTab) => {
            onTabChange?.(nextTab);
          }}
          onEditCourse={onEditCourse}
        />
      </TabsContent>

      <TabsContent value="modules">
        <CourseManageModulesPanel
          courseId={courseId}
          course={course}
          disabled={contentDisabled}
          onRefresh={onSummaryRefresh}
          onMutationSuccess={onMutationSuccess}
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
