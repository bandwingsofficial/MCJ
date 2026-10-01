"use client";

import { BookOpen, Radio } from "lucide-react";

import { SyllabusModuleAccordion } from "@/src/features/learning/components/syllabus/syllabus-module-accordion";
import type {
  LearningContentMode,
  ModuleTreeDto,
  StudentLearningAccessDto,
} from "@/src/features/learning/types/learning.types";
import type { ProgressMap } from "@/src/features/learning/utils/progress.utils";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  courseId: string;
  courseTitle: string;
  modules: ModuleTreeDto[];
  progressMap: ProgressMap;
  learningAccess: StudentLearningAccessDto;
  contentMode: LearningContentMode;
  onContentModeChange: (mode: LearningContentMode) => void;
  currentLessonId?: string;
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
}

function filterModulesForMode(
  modules: ModuleTreeDto[],
  mode: LearningContentMode,
): ModuleTreeDto[] {
  if (mode === "self_paced") {
    return modules
      .map((module) => ({
        ...module,
        lessons: module.lessons.filter(
          (lesson) =>
            Boolean(lesson.videoUrl) ||
            (lesson.selfPacedVideos ?? []).some((video) =>
              Boolean(video.videoUrl),
            ),
        ),
      }))
      .filter((module) => module.lessons.length > 0);
  }

  return modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) =>
        (lesson.liveRecordedVideos ?? []).some((video) =>
          Boolean(video.videoUrl),
        ),
      ),
    }))
    .filter((module) => module.lessons.length > 0);
}

export function LearningCourseSidebar({
  courseId,
  courseTitle,
  modules,
  progressMap,
  learningAccess,
  contentMode,
  onContentModeChange,
  currentLessonId,
  expandedModuleId,
  onToggleModule,
}: Props) {
  const filteredModules = filterModulesForMode(modules, contentMode);
  const showLiveTab = learningAccess.canAccessLiveRecorded;

  return (
    <aside className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-xs font-medium text-slate-500">{courseTitle}</p>
        <p className="mt-0.5 text-sm font-semibold text-[#0B1F3A]">
          Course content
        </p>
      </div>

      <div className="space-y-2 border-b border-slate-100 p-3">
        {showLiveTab ? (
          <button
            type="button"
            onClick={() => onContentModeChange("live_recorded")}
            className={cn(
              "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              contentMode === "live_recorded"
                ? "border-violet-200 bg-violet-50"
                : "border-transparent hover:bg-slate-50",
            )}
          >
            <Radio
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                contentMode === "live_recorded"
                  ? "text-violet-600"
                  : "text-slate-400",
              )}
            />
            <span>
              <span className="block text-sm font-semibold text-[#0B1F3A]">
                Recorded Videos
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Live sessions for your batch
              </span>
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onContentModeChange("self_paced")}
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
            contentMode === "self_paced"
              ? "border-violet-200 bg-violet-50"
              : "border-transparent hover:bg-slate-50",
          )}
        >
          <BookOpen
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0",
              contentMode === "self_paced" ? "text-violet-600" : "text-slate-400",
            )}
          />
          <span>
            <span className="block text-sm font-semibold text-[#0B1F3A]">
              Self-Paced Videos
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Learn at your own pace
            </span>
          </span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredModules.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-xs text-slate-500">
            No lessons in this section yet.
          </p>
        ) : (
          <SyllabusModuleAccordion
            courseId={courseId}
            modules={filteredModules}
            progressMap={progressMap}
            currentLessonId={currentLessonId}
            expandedModuleId={expandedModuleId}
            onToggleModule={onToggleModule}
            lockExpandedModule
          />
        )}
      </div>
    </aside>
  );
}
