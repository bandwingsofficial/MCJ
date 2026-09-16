"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from "lucide-react";

import { LessonTypeIcon } from "@/src/features/learning/components/syllabus/lesson-type-icon";
import type { ModuleTreeDto } from "@/src/features/learning/types/learning.types";
import {
  formatLessonLabel,
  formatModuleLabel,
  getModuleProgress,
  type ProgressMap,
} from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";
import { cn } from "@/src/shared/lib/cn";

interface SyllabusModuleAccordionProps {
  courseId: string;
  modules: ModuleTreeDto[];
  progressMap: ProgressMap;
  currentLessonId?: string;
  expandedModuleId: string | null;
  onToggleModule: (moduleId: string) => void;
}

export function SyllabusModuleAccordion({
  courseId,
  modules,
  progressMap,
  currentLessonId,
  expandedModuleId,
  onToggleModule,
}: SyllabusModuleAccordionProps) {
  return (
    <div className="space-y-2">
      {modules
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((module) => {
          const moduleProgress = getModuleProgress(module, progressMap);
          const expanded = expandedModuleId === module.id;

          return (
            <div
              key={module.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
                onClick={() => onToggleModule(module.id)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
                    {formatModuleLabel(module.displayOrder)}
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
                    {module.lessons
                      .slice()
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((lesson) => {
                        const completed =
                          progressMap.get(lesson.id)?.isCompleted ?? false;
                        const isCurrent = currentLessonId === lesson.id;

                        return (
                          <Link
                            key={lesson.id}
                            href={getLessonLearningPath(courseId, lesson.id)}
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
                              hasVideo={Boolean(lesson.videoUrl)}
                              hasQuiz={Boolean(lesson.quiz)}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                {formatLessonLabel(lesson.displayOrder)}
                              </p>
                              <p className="font-medium text-[#0B1F3A]">
                                {lesson.title}
                              </p>
                              {lesson.description ? (
                                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                  {lesson.description}
                                </p>
                              ) : null}
                              <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                                {lesson.contentType}
                              </p>
                            </div>
                            {completed ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            ) : (
                              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                            )}
                          </Link>
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
