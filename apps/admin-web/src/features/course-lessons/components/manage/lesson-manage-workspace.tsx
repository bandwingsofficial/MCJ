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

import type { CourseLesson } from "@/src/features/course-lessons/types";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { ModuleVideosTab } from "@/src/features/course-modules/components/manage/module-videos-tab";
import { ModuleLiveRecordedVideosTab } from "@/src/features/course-modules/components/manage/module-live-recorded-videos-tab";
import {
  ModuleAssignmentsTab,
  ModuleQuizzesTab,
  ModuleResourcesTab,
} from "@/src/features/course-modules/components/manage/module-other-tabs";
import { useLessonContentData } from "@/src/features/course-lessons/hooks/use-lesson-content-data";
import { getPlainLessonPosition } from "@/src/features/course-lessons/utils/lesson-order.utils";
import { LessonManageHeader } from "@/src/features/course-lessons/components/manage/lesson-manage-header";
import { LessonOverviewTab } from "@/src/features/course-lessons/components/manage/lesson-overview-tab";

export type LessonManageTab =
  | "overview"
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
  lesson: CourseLesson;
}

export function LessonManageWorkspace({
  courseId,
  courseTitle,
  courseCode,
  module,
  lesson,
}: Props) {
  const [tab, setTab] = useState<LessonManageTab>("overview");

  const {
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
    resources,
    quizzes,
    selfPacedVideos,
    liveRecordedVideos,
    isLoading,
    error,
    refetch,
  } = useLessonContentData(module.id, lesson.id);

  const lessonPosition = getPlainLessonPosition(
    lessons,
    lesson.id,
    quizLessonIds,
    resourceShellLessonIds,
  );

  return (
    <div className="space-y-4">
      <LessonManageHeader
        courseId={courseId}
        courseTitle={courseTitle}
        courseCode={courseCode}
        module={module}
        lesson={lesson}
        lessonPosition={lessonPosition}
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as LessonManageTab)}
      >
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          {(
            [
              ["overview", "Overview"],
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
              className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <SkeletonTable rows={6} />
        ) : error ? (
          <ErrorState
            title="Failed to load lesson content"
            description={error}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : (
          <>
            <TabsContent value="overview">
              <LessonOverviewTab
                module={module}
                lesson={lesson}
                lessonPosition={lessonPosition}
                resources={resources}
                quizzes={quizzes}
                selfPacedCount={selfPacedVideos.length}
                liveRecordedCount={liveRecordedVideos.length}
              />
            </TabsContent>

            <TabsContent value="videos">
              <ModuleVideosTab
                moduleId={module.id}
                parentLessonId={lesson.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="live">
              <ModuleLiveRecordedVideosTab
                moduleId={module.id}
                parentLessonId={lesson.id}
                lessons={lessons}
                quizLessonIds={quizLessonIds}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="resources">
              <ModuleResourcesTab
                moduleId={module.id}
                lessonId={lesson.id}
                resources={resources}
                onRefresh={refetch}
              />
            </TabsContent>

            <TabsContent value="quizzes">
              <ModuleQuizzesTab
                courseId={courseId}
                moduleId={module.id}
                lessonId={lesson.id}
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
