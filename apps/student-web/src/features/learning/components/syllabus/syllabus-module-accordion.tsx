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
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
  lockExpandedModule?: boolean;
}

export function SyllabusModuleAccordion({
  courseId,
  modules,
  progressMap,
  currentLessonId,
  expandedModuleId,
  onToggleModule,
  lockExpandedModule = false,
}: SyllabusModuleAccordionProps) {
  const router = useRouter();
  const orderedModules = sortModules(modules);

  return (
    <div className="space-y-2">
      {orderedModules.map((module) => {
        const moduleOrdinal = getModuleOrdinal(orderedModules, module.id);
        const moduleProgress = getModuleProgress(module, progressMap);
        const moduleContainsCurrentLesson =
          Boolean(currentLessonId) &&
          module.lessons.some((lesson) => lesson.id === currentLessonId);
        const expanded = lockExpandedModule
          ? expandedModuleId === module.id ||
            (expandedModuleId === null && moduleContainsCurrentLesson)
          : expandedModuleId === module.id;
        const orderedLessons = sortLessons(module.lessons);

        return (
          <div
            key={module.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-4 text-left"
              onClick={() => {
                onToggleModule(module.id);
              }}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                  {moduleOrdinal ? formatModuleOrdinal(moduleOrdinal) : module.title}
                </p>
                <p className="font-semibold text-[#0B1F3A]">{module.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {moduleProgress.completedLessons}/{moduleProgress.totalLessons}{" "}
                  topics · {moduleProgress.percentage}% complete
                </p>
              </div>
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
            </button>

            {expanded ? (
              <div className="border-t border-slate-100 px-4 py-3">
                <div className="space-y-2">
                  {orderedLessons.map((lesson) => {
                    const lessonOrdinal = getLessonOrdinal(module, lesson.id);
                    const completed =
                      progressMap.get(lesson.id)?.isCompleted ?? false;
                    const isCurrent = currentLessonId === lesson.id;
                    const badges = getLessonContentBadges(lesson);

                    const lessonHref = getLessonLearningPath(
                      courseId,
                      lesson.id,
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
                          router.push(lessonHref);
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border px-3 py-3 transition",
                          isCurrent
                            ? "border-[#2563EB]/30 bg-[#F8FBFF]"
                            : completed
                              ? "border-emerald-100 bg-emerald-50/40"
                              : "border-slate-100 bg-white hover:border-slate-200",
                        )}
                      >
                        <LessonTypeIcon
                          contentType={lesson.contentType}
                          hasVideo={
                            Boolean(lesson.videoUrl) ||
                            Boolean(lesson.selfPacedVideos?.length)
                          }
                          hasQuiz={lesson.quiz?.status === "PUBLISHED"}
                        />
                        <div className="min-w-0 flex-1">
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
                        </div>
                        {completed ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        )}
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
