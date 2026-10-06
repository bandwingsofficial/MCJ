"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileQuestion,
  FileText,
} from "lucide-react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { useInitialLoadingOnly } from "@/src/shared/hooks/use-initial-loading-only";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { ModuleManageHeader } from "@/src/features/course-modules/components/manage/module-manage-header";
import { ModuleLessonsTab } from "@/src/features/course-modules/components/manage/module-lessons-tab";
import {
  ModuleResourcesTab,
  ModuleTestsTab,
} from "@/src/features/course-modules/components/manage/module-other-tabs";
import { useModuleContentData } from "@/src/features/course-modules/hooks/use-module-content-data";

export type ModuleManageTab = "lessons" | "resources" | "test";

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: ModuleManageTab;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "lessons", label: "Lessons", icon: BookOpen },
  { value: "resources", label: "Resources", icon: FileText },
  { value: "test", label: "Test", icon: FileQuestion },
];

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
  onModuleRefresh?: () => Promise<void>;
}

export function ModuleManageWorkspace({
  courseId,
  courseTitle,
  courseCode,
  module,
  onModuleRefresh,
}: Props) {
  const [tab, setTab] = useState<ModuleManageTab>("lessons");

  const {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    lessonContentCountsByLessonId,
    moduleResources,
    moduleTests,
    isLoading,
    error,
    refetch,
  } = useModuleContentData(module.id);

  const refreshModuleContent = async () => {
    await refetch();
    await onModuleRefresh?.();
  };

  const isInitialLoading = useInitialLoadingOnly(isLoading);

  return (
    <div className="space-y-4">
      <ModuleManageHeader
        courseId={courseId}
        courseTitle={courseTitle}
        courseCode={courseCode}
        module={module}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as ModuleManageTab)}
      >
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className={TAB_CLASS}>
              <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {isInitialLoading ? (
          <SkeletonTable rows={6} />
        ) : error ? (
          <ErrorState
            title="Failed to load module content"
            description={error}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : (
          <>
            <TabsContent value="lessons">
              <ModuleLessonsTab
                courseId={courseId}
                moduleId={module.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                resourceShellLessonIds={resourceShellLessonIds}
                lessonContentCountsByLessonId={lessonContentCountsByLessonId}
                onRefresh={refreshModuleContent}
              />
            </TabsContent>

            <TabsContent value="resources">
              <ModuleResourcesTab
                moduleId={module.id}
                resources={moduleResources}
                onRefresh={refreshModuleContent}
              />
            </TabsContent>

            <TabsContent value="test">
              <ModuleTestsTab
                courseId={courseId}
                moduleId={module.id}
                quizzes={moduleTests}
                onRefresh={refreshModuleContent}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
