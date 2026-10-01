"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";

import { LessonTypeIcon } from "@/src/features/learning/components/syllabus/lesson-type-icon";
import type { ModuleTreeDto } from "@/src/features/learning/types/learning.types";
import {
  formatLessonOrdinal,
  formatModuleOrdinal,
  getLessonOrdinal,
  getModuleOrdinal,
  sortLessons,
  sortModules,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import {
  getModuleProgress,
  type ProgressMap,
} from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";
import { cn } from "@/src/shared/lib/cn";

function formatSidebarLessonDuration(duration: number | null): string | null {
  if (duration == null || duration <= 0) {
    return null;
  }

  if (duration <= 240) {
    return `${duration} min`;
  }

  const minutes = Math.max(1, Math.floor(duration / 60));
  return `${minutes} min`;
}

function getLessonContentBadges(
  lesson: ModuleTreeDto["lessons"][number],
): string[] {
  const badges: string[] = [];

  if (lesson.learnItems?.length) {
    badges.push("Learn");
  }

  if (
    lesson.videoUrl ||
    lesson.selfPacedVideos?.some((video) => Boolean(video.videoUrl))
  ) {
    badges.push("Video");
  }

  if (lesson.liveRecordedVideos?.some((video) => Boolean(video.videoUrl))) {
    badges.push("Live");
  }

  if (lesson.resources.length) {
    badges.push("Resources");
  }

  if (lesson.quiz?.status === "PUBLISHED") {
    badges.push("Quiz");
  }

  return badges;
}

interface SyllabusModuleAccordionProps {
  courseId: string;
  modules: ModuleTreeDto[];
  progressMap: ProgressMap;
  currentLessonId?: string;
  selectedLessonId?: string;
  onSelectLesson?: (lessonId: string, moduleId: string) => void;
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
  lockExpandedModule?: boolean;
  variant?: "default" | "sidebar";
}

export function SyllabusModuleAccordion({
  courseId,
  modules,
  progressMap,
  currentLessonId,
  selectedLessonId,
  onSelectLesson,
  expandedModuleId,
  onToggleModule,
  variant = "default",
}: SyllabusModuleAccordionProps) {
  const router = useRouter();
  const orderedModules = sortModules(modules);
  const isSidebar = variant === "sidebar";

  return (
    <div className={cn("space-y-1", isSidebar && "space-y-0.5")}>
      {orderedModules.map((module) => {
        const moduleOrdinal = getModuleOrdinal(orderedModules, module.id);
        const moduleProgress = getModuleProgress(module, progressMap);
        const expanded = expandedModuleId === module.id;
        const orderedLessons = sortLessons(module.lessons);
        const moduleLabel = moduleOrdinal
          ? formatModuleOrdinal(moduleOrdinal)
          : module.title;

        return (
          <div
            key={module.id}
            className={cn(
              "overflow-hidden",
              isSidebar ? "rounded-lg" : "rounded-xl border border-slate-200 bg-white",
            )}
          >
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 text-left",
                isSidebar
                  ? "rounded-md px-2 py-2 hover:bg-white/80"
                  : "gap-3 px-4 py-4",
              )}
              onClick={() => {
                onToggleModule(module.id);
              }}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              )}
              <div className="min-w-0 flex-1">
                {isSidebar ? (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-600/90">
                        {moduleLabel}
                      </p>
                      <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#0B1F3A]">
                        {module.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {moduleProgress.state === "completed" ? (
                          <span className="text-emerald-600">
                            {moduleProgress.completedLessons}/
                            {moduleProgress.totalLessons} complete
                          </span>
                        ) : (
                          <>
                            {moduleProgress.completedLessons}/
                            {moduleProgress.totalLessons} lessons
                            {moduleProgress.totalLessons > 0 ? (
                              <span className="text-slate-400">
                                {" "}
                                · {moduleProgress.percentage}%
                              </span>
                            ) : null}
                          </>
                        )}
                      </p>
                    </div>
                    {moduleProgress.state === "completed" ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                      {moduleLabel}
                    </p>
                    <p className="font-semibold text-[#0B1F3A]">
                      {module.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {moduleProgress.completedLessons}/
                      {moduleProgress.totalLessons} topics ·{" "}
                      {moduleProgress.percentage}% complete
                    </p>
                  </>
                )}
              </div>
              {!isSidebar ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                    moduleProgress.state === "completed"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : moduleProgress.state === "in_progress"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                  )}
                >
                  {moduleProgress.state === "completed"
                    ? "Completed"
                    : moduleProgress.state === "in_progress"
                      ? "In Progress"
                      : "Not Started"}
                </span>
              ) : null}
            </button>

            {expanded ? (
              <div
                className={cn(
                  isSidebar
                    ? "ml-4 space-y-0.5 border-l border-slate-200/80 pb-1 pl-2"
                    : "border-t border-slate-100 px-4 py-3",
                )}
              >
                <div className={cn(isSidebar ? "space-y-0.5" : "space-y-2")}>
                  {orderedLessons.map((lesson) => {
                    const lessonProgress = progressMap.get(lesson.id);
                    const completed = lessonProgress?.isCompleted ?? false;
                    const watchedSeconds = lessonProgress?.watchedSeconds ?? 0;
                    const inProgress =
                      !completed && watchedSeconds > 0;
                    const lessonOrdinal = getLessonOrdinal(module, lesson.id);
                    const activeLessonId =
                      isSidebar && selectedLessonId
                        ? selectedLessonId
                        : currentLessonId;
                    const isCurrent = activeLessonId === lesson.id;
                    const badges = getLessonContentBadges(lesson);
                    const lessonHref = getLessonLearningPath(
                      courseId,
                      lesson.id,
                    );
                    const ordinalLabel = lessonOrdinal
                      ? formatLessonOrdinal(lessonOrdinal).replace(
                          /^Lesson\s+/i,
                          "",
                        )
                      : null;
                    const durationLabel = formatSidebarLessonDuration(
                      lesson.duration,
                    );

                    return (
                      <a
                        key={lesson.id}
                        href={lessonHref}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (
                            event.defaultPrevented ||
                            event.button !== 0 ||
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          ) {
                            return;
                          }
                          event.preventDefault();
                          if (isSidebar && onSelectLesson) {
                            onSelectLesson(lesson.id, module.id);
                            return;
                          }
                          router.push(lessonHref);
                        }}
                        className={cn(
                          "flex items-start gap-2 rounded-md transition",
                          isSidebar
                            ? "border border-transparent px-2 py-1.5"
                            : "items-start gap-3 rounded-lg border px-3 py-3",
                          isCurrent
                            ? isSidebar
                              ? "border-violet-200/80 bg-violet-50/90 shadow-sm"
                              : "border-[#2563EB]/30 bg-[#F8FBFF]"
                            : completed
                              ? isSidebar
                                ? "hover:bg-emerald-50/50"
                                : "border-emerald-100 bg-emerald-50/40"
                              : isSidebar
                                ? "hover:bg-white/90"
                                : "border-slate-100 bg-white hover:border-slate-200",
                        )}
                      >
                        {!isSidebar ? (
                          <LessonTypeIcon
                            contentType={lesson.contentType}
                            hasVideo={
                              Boolean(lesson.videoUrl) ||
                              Boolean(lesson.selfPacedVideos?.length)
                            }
                            hasQuiz={lesson.quiz?.status === "PUBLISHED"}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          {isSidebar ? (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "line-clamp-2 text-xs leading-snug",
                                    isCurrent
                                      ? "font-semibold text-violet-900"
                                      : completed
                                        ? "font-medium text-slate-800"
                                        : "text-slate-700",
                                  )}
                                >
                                  {ordinalLabel ? (
                                    <span className="mr-1.5 tabular-nums text-slate-400">
                                      {ordinalLabel}
                                    </span>
                                  ) : null}
                                  {lesson.title}
                                </p>
                                {durationLabel ? (
                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    {durationLabel}
                                  </p>
                                ) : null}
                              </div>
                              <span className="mt-0.5 shrink-0">
                                {completed ? (
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </span>
                                ) : inProgress ? (
                                  <span className="relative flex h-5 w-5 items-center justify-center">
                                    <Circle className="h-4 w-4 text-violet-400" />
                                    <span className="absolute h-2 w-2 rounded-full bg-violet-500" />
                                  </span>
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-300" />
                                )}
                              </span>
                            </div>
                          ) : (
                            <>
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                {lessonOrdinal
                                  ? formatLessonOrdinal(lessonOrdinal)
                                  : lesson.title}
                              </p>
                              <p className="font-medium text-[#0B1F3A]">
                                {lesson.title}
                              </p>
                              {lesson.description ? (
                                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                  {lesson.description}
                                </p>
                              ) : null}
                              {badges.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {badges.map((badge) => (
                                    <span
                                      key={`${lesson.id}-${badge}`}
                                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600"
                                    >
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>
                        {!isSidebar ? (
                          completed ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          ) : (
                            <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                          )
                        ) : null}
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
