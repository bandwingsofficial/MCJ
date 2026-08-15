"use client";

import { useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { ModuleManageHeader } from "@/src/features/course-modules/components/manage/module-manage-header";
import { ModuleLessonsTab } from "@/src/features/course-modules/components/manage/module-lessons-tab";
import { ModuleVideosTab } from "@/src/features/course-modules/components/manage/module-videos-tab";
import { ModuleLiveRecordedVideosTab } from "@/src/features/course-modules/components/manage/module-live-recorded-videos-tab";
import {
  ModuleAssignmentsTab,
  ModuleQuizzesTab,
  ModuleResourcesTab,
} from "@/src/features/course-modules/components/manage/module-other-tabs";
import { useModuleContentData } from "@/src/features/course-modules/hooks/use-module-content-data";

export type ModuleManageTab =
  | "lessons"
  | "videos"
  | "live"
  | "resources"
  | "quizzes"
  | "assignments";

interface Props {
  courseId: string;
  courseTitle: string;
  courseCode: string;
  module: CourseModule;
  editOpen: boolean;
  editLoading: boolean;
  onEditOpen: () => void;
  onEditClose: () => void;
  onEditSubmit: (values: {
    title: string;
    description: string;
    keySkills: string[];
  }) => Promise<void>;
}

export function ModuleManageWorkspace({
  courseId,
  courseTitle,
  courseCode,
  module,
  editOpen,
  editLoading,
  onEditOpen,
  onEditClose,
  onEditSubmit,
}: Props) {
  const [tab, setTab] = useState<ModuleManageTab>("lessons");

  const {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    resources,
    quizzes,
    isLoading,
    error,
    refetch,
  } = useModuleContentData(module.id);

  return (
    <div className="space-y-4">
      <ModuleManageHeader
        courseId={courseId}
        courseTitle={courseTitle}
        courseCode={courseCode}
        module={module}
        editOpen={editOpen}
        editLoading={editLoading}
        onEditOpen={onEditOpen}
        onEditClose={onEditClose}
        onEditSubmit={onEditSubmit}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as ModuleManageTab)}
      >
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          {(
            [
              ["lessons", "Lessons"],
              ["videos", "Self-Paced Videos"],
              ["live", "Live Recorded Videos"],
              ["resources", "Resources"],
              ["quizzes", "Quizzes"],
              ["assignments", "Assignments"],
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

        {isLoading ? (
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
                moduleId={module.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                resourceShellLessonIds={resourceShellLessonIds}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="videos">
              <ModuleVideosTab
                moduleId={module.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="live">
              <ModuleLiveRecordedVideosTab
                moduleId={module.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="resources">
              <ModuleResourcesTab
                moduleId={module.id}
                resources={resources}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="quizzes">
              <ModuleQuizzesTab
                courseId={courseId}
                moduleId={module.id}
                quizzes={quizzes}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="assignments">
              <ModuleAssignmentsTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
