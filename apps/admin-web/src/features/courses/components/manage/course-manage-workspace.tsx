"use client";

import type { LucideIcon } from "lucide-react";
import {
  HelpCircle,
  Layers,
  LayoutDashboard,
  Users,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type {
  CourseDetails,
  CourseSummary,
} from "@/src/features/courses/types/course.types";
import { COURSE_MANAGE_DEFAULT_TAB } from "@/src/features/courses/utils/course-manage.routes";

import { CourseManageBatchesPanel } from "./course-manage-batches-panel";
import { CourseManageFaqPanel } from "./course-manage-faq-panel";
import { CourseManageModulesPanel } from "./course-manage-modules-panel";
import { CourseManageOverviewPanel } from "./course-manage-overview-panel";

interface Props {
  courseId: string;
  course: CourseDetails;
  summary: CourseSummary | null;
  summaryLoading?: boolean;
  activeTab?: TabKey;
  onSummaryRefresh: () => Promise<void>;
  onCourseUpdated: (course: CourseDetails) => void;
  onTabChange?: (tab: TabKey) => void;
  onMutationSuccess?: () => Promise<void>;
}

export type TabKey = "overview" | "modules" | "batches" | "faq";

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: TabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "modules", label: "Modules", icon: Layers },
  { value: "batches", label: "Batches", icon: Users },
  { value: "faq", label: "FAQ", icon: HelpCircle },
];

export function CourseManageWorkspace({
  courseId,
  course,
  summary,
  summaryLoading = false,
  activeTab = COURSE_MANAGE_DEFAULT_TAB,
  onSummaryRefresh,
  onTabChange,
  onMutationSuccess,
}: Props) {
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
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <CourseManageOverviewPanel
          course={course}
          summary={summary}
          summaryLoading={summaryLoading}
          disabled={contentDisabled}
          onRefresh={onSummaryRefresh}
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

      <TabsContent value="batches">
        <CourseManageBatchesPanel courseId={courseId} />
      </TabsContent>

      <TabsContent value="faq">
        <CourseManageFaqPanel courseId={courseId} disabled={contentDisabled} />
      </TabsContent>
    </Tabs>
  );
}
