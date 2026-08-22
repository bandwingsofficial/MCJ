"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Clock3,
  Lock,
} from "lucide-react";

import { appToast } from "@/src/shared/components/ui/toast";

import type {
  CoursePreviewLesson,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";

interface CourseCurriculumAccordionProps {
  modules: CoursePreviewModule[] | unknown;
}

function formatLessonDuration(
  duration?: number | null,
): string | null {
  if (
    typeof duration !== "number" ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return null;
  }

  if (duration >= 60) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    return minutes > 0
      ? `${hours}h ${minutes}m`
      : `${hours}h`;
  }

  return `${duration} min`;
}

function getModuleDuration(
  module: CoursePreviewModule,
): string | null {
  const lessons = Array.isArray(module?.lessons)
    ? module.lessons
    : [];

  const total = lessons.reduce((sum, lesson) => {
    const duration = lesson?.duration;

    if (
      typeof duration !== "number" ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return sum;
    }

    return sum + duration;
  }, 0);

  return formatLessonDuration(total);
}

function getDisplayOrder(value?: number | null): number {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : Number.MAX_SAFE_INTEGER;
}

function formatLessonNumber(order: number): string {
  return String(order).padStart(2, "0");
}

function handleLockedLessonClick(isPreview?: boolean) {
  /*
   * Preview lessons are allowed to continue through
   * whatever preview behavior the application already supports.
   */
  if (isPreview) {
    return;
  }

  appToast.info(
    "Please enroll in this course to access this lesson.",
  );
}

export function CourseCurriculumAccordion({
  modules,
}: CourseCurriculumAccordionProps) {
  /*
   * Never trust the API response to already be an array.
   */
  const sortedModules = useMemo(() => {
    const safeModules: CoursePreviewModule[] =
      Array.isArray(modules) ? modules : [];

    return [...safeModules].sort(
      (a, b) =>
        getDisplayOrder(a?.displayOrder) -
        getDisplayOrder(b?.displayOrder),
    );
  }, [modules]);

  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  if (sortedModules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
        <Lock className="mx-auto h-7 w-7 text-slate-300" />

        <p className="mt-3 text-sm font-semibold text-slate-700">
          No curriculum available yet.
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Course lessons will appear here when they are
          published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedModules.map((module, moduleIndex) => {
        const moduleId = module?.id;

        /*
         * A module without an ID cannot safely be used as
         * an accordion key.
         */
        if (!moduleId) {
          return null;
        }

        const isOpen = openModuleId === moduleId;

        const lessons: CoursePreviewLesson[] =
          Array.isArray(module.lessons)
            ? [...module.lessons].sort(
                (a, b) =>
                  getDisplayOrder(a?.displayOrder) -
                  getDisplayOrder(b?.displayOrder),
              )
            : [];

        const moduleDuration =
          getModuleDuration(module);

        return (
          <section
            key={moduleId}
            className="
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              transition-shadow
              duration-200
              hover:shadow-sm
            "
          >
            {/* MODULE HEADER */}
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`module-${moduleId}`}
              onClick={() =>
                setOpenModuleId(
                  isOpen ? null : moduleId,
                )
              }
              className="
                flex
                w-full
                items-center
                gap-4
                px-4
                py-4
                text-left
                transition-colors
                hover:bg-slate-50
                sm:px-5
              "
            >
              {/* Module number */}
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-blue-50
                  text-xs
                  font-bold
                  text-blue-600
                "
              >
                {String(moduleIndex + 1).padStart(2, "0")}
              </div>

              {/* Module title */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Module {moduleIndex + 1}
                </p>

                <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                  {module.title || "Untitled Module"}
                </h3>
              </div>

              {/* Module metadata */}
              <div className="hidden shrink-0 items-center gap-4 text-xs text-slate-500 sm:flex">
                <span>
                  {lessons.length}{" "}
                  {lessons.length === 1
                    ? "Lesson"
                    : "Lessons"}
                </span>

                {moduleDuration && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                    {moduleDuration}
                  </span>
                )}
              </div>

              {/* Chevron */}
              <ChevronDown
                aria-hidden="true"
                className={`
                  h-5
                  w-5
                  shrink-0
                  text-slate-400
                  transition-transform
                  duration-300
                  ${isOpen ? "rotate-180" : ""}
                `}
              />
            </button>

            {/* ACCORDION CONTENT */}
            <div
              id={`module-${moduleId}`}
              className={`
                grid
                transition-all
                duration-300
                ease-in-out
                ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-slate-100 bg-slate-50/30">
                  {/* Mobile metadata */}
                  <div className="flex items-center gap-4 border-b border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 sm:hidden">
                    <span>
                      {lessons.length}{" "}
                      {lessons.length === 1
                        ? "Lesson"
                        : "Lessons"}
                    </span>

                    {moduleDuration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {moduleDuration}
                      </span>
                    )}
                  </div>

                  {/* LESSONS */}
                  <div className="px-4 sm:px-5">
                    {lessons.length === 0 ? (
                      <div className="py-5 text-center text-xs text-slate-500">
                        No lessons available.
                      </div>
                    ) : (
                      lessons.map(
                        (
                          lesson,
                          lessonIndex,
                        ) => {
                          if (!lesson?.id) {
                            return null;
                          }

                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() =>
                                handleLockedLessonClick(
                                  lesson.isPreview,
                                )
                              }
                              className="
                                flex
                                w-full
                                items-center
                                gap-3
                                border-b
                                border-slate-100
                                py-3.5
                                text-left
                                transition-colors
                                last:border-b-0
                                hover:bg-slate-50
                              "
                            >
                              {/* Lesson number */}
                              <span
                                className="
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-md
                                  bg-white
                                  text-[11px]
                                  font-semibold
                                  text-slate-400
                                  ring-1
                                  ring-slate-200
                                "
                              >
                                {formatLessonNumber(
                                  lessonIndex + 1,
                                )}
                              </span>

                              {/* Lesson title */}
                              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                                {lesson.title ||
                                  "Untitled Lesson"}
                              </span>

                              {/* Duration, only if available */}
                              {lesson.duration ? (
                                <span className="hidden shrink-0 text-[11px] text-slate-400 sm:block">
                                  {formatLessonDuration(
                                    lesson.duration,
                                  )}
                                </span>
                              ) : null}

                              {/* LOCK */}
                              <span
                                className="
                                  flex
                                  h-7
                                  w-7
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-md
                                  bg-slate-100
                                "
                              >
                                <Lock className="h-3.5 w-3.5 text-slate-400" />
                              </span>
                            </button>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}