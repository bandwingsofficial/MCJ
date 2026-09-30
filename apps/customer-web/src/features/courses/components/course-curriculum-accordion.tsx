"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Clock3,
  Lock,
  PlayCircle,
  Unlock,
  Video,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { appToast } from "@/src/shared/components/ui/toast";
import { formatVideoDurationHms } from "@/src/shared/utils/duration";

import { CourseLessonPreviewSection } from "@/src/features/courses/components/course-lesson-preview-section";
import type {
  CoursePreviewLesson,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";

interface CourseCurriculumAccordionProps {
  courseId: string;
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

function notifyLockedLesson() {
  appToast.info(
    "Please enroll in this course to access this lesson.",
  );
}

function getLessonContentIndicators(lesson: CoursePreviewLesson): string[] {
  const indicators: string[] = [];

  if ((lesson.learnItemCount ?? 0) > 0) {
    indicators.push("Learn");
  }

  if ((lesson.selfPacedVideoCount ?? 0) > 0) {
    indicators.push("Video");
  }

  if ((lesson.liveRecordedVideoCount ?? 0) > 0) {
    indicators.push("Live/Recorded Session");
  }

  if ((lesson.resourceCount ?? 0) > 0) {
    indicators.push("Resource");
  }

  if (lesson.hasQuiz) {
    indicators.push("Quiz");
  }

  return indicators;
}

function LessonContentIndicators({
  lesson,
}: {
  lesson: CoursePreviewLesson;
}) {
  const indicators = getLessonContentIndicators(lesson);

  if (indicators.length === 0) {
    return null;
  }

  return (
    <p className="hidden shrink-0 text-xs font-medium text-slate-500 sm:block">
      {indicators.join(" · ")}
    </p>
  );
}

export function CourseCurriculumAccordion({
  courseId,
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
  const [openPreviewLessonId, setOpenPreviewLessonId] = useState<
    string | null
  >(null);

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
                  text-[#2563D9]
                "
              >
                {String(moduleIndex + 1).padStart(2, "0")}
              </div>

              {/* Module title */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2563D9]">
                  Module {moduleIndex + 1}
                </p>

                <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                  {module.title || "Untitled Module"}
                </h3>

                {module.description?.trim() ? (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {module.description.trim()}
                  </p>
                ) : null}
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

                          const durationHms = formatVideoDurationHms(
                            lesson.duration,
                          );
                          const canPreview = Boolean(lesson.isPreview);
                          const hasSelfPacedVideo =
                            (lesson.selfPacedVideoCount ?? 0) > 0;
                          const isPreviewOpen =
                            openPreviewLessonId === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              className="border-b border-slate-100 last:border-b-0"
                            >
                              <div
                                className="
                                  flex
                                  w-full
                                  flex-col
                                  gap-2
                                  py-3.5
                                  sm:flex-row
                                  sm:items-center
                                  sm:gap-3
                                "
                              >
                                <div className="flex min-w-0 flex-1 items-start gap-3">
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
                                    {formatLessonNumber(lessonIndex + 1)}
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium text-slate-800">
                                      {lesson.title || "Untitled Lesson"}
                                    </span>
                                    {lesson.description?.trim() ? (
                                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                                        {lesson.description.trim()}
                                      </span>
                                    ) : null}

                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                      {hasSelfPacedVideo ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                          <Video
                                            className="h-3.5 w-3.5 text-[#2563D9]"
                                            aria-hidden
                                          />
                                          Video
                                        </span>
                                      ) : null}

                                      {canPreview ? (
                                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                                          <Unlock
                                            className="h-3.5 w-3.5"
                                            aria-hidden
                                          />
                                          Preview
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                                          <Lock
                                            className="h-3.5 w-3.5"
                                            aria-hidden
                                          />
                                          Locked
                                        </span>
                                      )}

                                      {durationHms ? (
                                        <span>Duration: {durationHms}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 pl-10 sm:pl-0">
                                  <LessonContentIndicators lesson={lesson} />

                                  {canPreview ? (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={
                                        isPreviewOpen ? "secondary" : "outline"
                                      }
                                      className="h-8 gap-1.5 text-xs"
                                      onClick={() => {
                                        setOpenPreviewLessonId((current) =>
                                          current === lesson.id
                                            ? null
                                            : lesson.id,
                                        );
                                      }}
                                    >
                                      <PlayCircle
                                        className="h-3.5 w-3.5"
                                        aria-hidden
                                      />
                                      {isPreviewOpen ? "Hide" : "Preview"}
                                    </Button>
                                  ) : (
                                    <button
                                      type="button"
                                      className="
                                        flex
                                        h-8
                                        items-center
                                        gap-1.5
                                        rounded-md
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        px-3
                                        text-xs
                                        font-medium
                                        text-slate-500
                                      "
                                      onClick={notifyLockedLesson}
                                    >
                                      <Lock
                                        className="h-3.5 w-3.5"
                                        aria-hidden
                                      />
                                      Locked
                                    </button>
                                  )}
                                </div>
                              </div>

                              {canPreview ? (
                                <div className="pb-3 pl-10 sm:pl-[2.875rem]">
                                  <CourseLessonPreviewSection
                                    courseId={courseId}
                                    lessonId={lesson.id}
                                    isOpen={isPreviewOpen}
                                  />
                                </div>
                              ) : null}
                            </div>
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