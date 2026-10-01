"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Radio } from "lucide-react";

import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

import type { CourseModuleListItem } from "@/src/features/course-modules/types/course-module.types";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { filterNormalLessons } from "@/src/features/course-modules/hooks/use-module-content-data";
import { branchLiveRecordedLessonPath } from "@/src/features/branches/utils/branch-live-recorded.routes";
import { isPlainLesson } from "@/src/features/course-modules/utils/module-content.utils";
import {
  formatLiveRecordedCount,
  formatModuleLiveSummary,
  LIVE_RECORDED_GRADIENT_BUTTON_CLASS,
} from "@/src/features/branches/components/live-recorded/branch-live-recorded-ui.constants";
import { cn } from "@/src/shared/lib/cn";

export interface BranchLiveRecordedModuleData {
  module: CourseModuleListItem;
  lessons: CourseLesson[];
  liveCountByLessonId: Map<string, number>;
}

interface Props {
  branchId: string;
  batchId: string;
  modules: BranchLiveRecordedModuleData[];
}

function filterManageableLessons(lessons: CourseLesson[]) {
  const emptyQuiz = new Set<string>();
  const emptyShell = new Set<string>();
  return filterNormalLessons(lessons, emptyQuiz, emptyShell)
    .filter((lesson) => isPlainLesson(lesson) && !lesson.isDeleted)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

function moduleLiveTotal(
  plainLessons: CourseLesson[],
  liveCountByLessonId: Map<string, number>,
): number {
  return plainLessons.reduce(
    (sum, lesson) => sum + (liveCountByLessonId.get(lesson.id) ?? 0),
    0,
  );
}

interface ModuleAccordionRowProps {
  branchId: string;
  batchId: string;
  module: CourseModuleListItem;
  index: number;
  plainLessons: CourseLesson[];
  liveCountByLessonId: Map<string, number>;
  isOpen: boolean;
  onToggle: () => void;
}

function ModuleAccordionRow({
  branchId,
  batchId,
  module,
  index,
  plainLessons,
  liveCountByLessonId,
  isOpen,
  onToggle,
}: ModuleAccordionRowProps) {
  const orderLabel = formatContentOrderNumber(
    module.displayOrder ?? index + 1,
  );
  const liveTotal = moduleLiveTotal(plainLessons, liveCountByLessonId);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-[0_1px_4px_rgba(16,42,86,0.04)] transition-all hover:border-[#DCE8F5] hover:shadow-sm",
        isOpen && "ring-1 ring-[#DCE8F5]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-50 to-[#F8FBFF] text-xs font-semibold text-violet-700 ring-1 ring-violet-100">
          {orderLabel}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[#102A56]">{module.title}</h3>
          <p className="mt-1 text-xs text-[#647A9B]">
            {formatModuleLiveSummary(plainLessons.length, liveTotal)}
          </p>
        </div>

        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE8F5] bg-white text-[#2563EB]">
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-[#E8F0FA] bg-[#FAFCFF] px-4 pb-4 pt-2">
          {plainLessons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm text-[#647A9B]">
              No lessons in this module.
            </p>
          ) : (
            <ul className="space-y-3">
              {plainLessons.map((lesson, lessonIndex) => {
                const liveCount = liveCountByLessonId.get(lesson.id) ?? 0;
                const lessonOrder = formatContentOrderNumber(
                  lesson.displayOrder ?? lessonIndex + 1,
                );
                const description = lesson.description?.trim();

                return (
                  <li
                    key={lesson.id}
                    className="rounded-xl border border-[#E1EBF5] bg-white p-4 shadow-[0_1px_4px_rgba(16,42,86,0.04)] transition-colors hover:border-[#DCE8F5]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF] text-xs font-semibold text-[#2563EB]">
                            {lessonOrder}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-[#102A56]">
                              {lesson.title}
                            </h4>
                            {description ? (
                              <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-[#647A9B]">
                                {description}
                              </p>
                            ) : (
                              <p className="mt-1.5 text-sm italic text-slate-400">
                                No description provided.
                              </p>
                            )}
                            <p
                              className={cn(
                                "mt-2 inline-flex items-center gap-1.5 text-xs font-medium",
                                liveCount > 0 ? "text-[#2563EB]" : "text-[#647A9B]",
                              )}
                            >
                              <Radio className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              {formatLiveRecordedCount(liveCount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 lg:max-w-[240px] lg:pt-1">
                        <Link
                          href={branchLiveRecordedLessonPath(
                            branchId,
                            batchId,
                            module.id,
                            lesson.id,
                          )}
                          className={cn(
                            LIVE_RECORDED_GRADIENT_BUTTON_CLASS,
                            "w-full sm:w-auto",
                          )}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          Add Live
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function BranchLiveRecordedModuleAccordion({
  branchId,
  batchId,
  modules,
}: Props) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  if (modules.length === 0) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
        <h3 className="text-base font-semibold text-[#102A56]">No modules yet</h3>
        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
          This course has no modules to manage live recordings for.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-2.5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#647A9B]">
          Modules
        </h2>
      </div>

      <div className="space-y-2 bg-[#FAFCFF] p-3 sm:p-4">
        {modules.map(({ module, lessons, liveCountByLessonId }, index) => (
          <ModuleAccordionRow
            key={module.id}
            branchId={branchId}
            batchId={batchId}
            module={module}
            index={index}
            plainLessons={filterManageableLessons(lessons)}
            liveCountByLessonId={liveCountByLessonId}
            isOpen={openModuleId === module.id}
            onToggle={() => {
              setOpenModuleId((current) =>
                current === module.id ? null : module.id,
              );
            }}
          />
        ))}
      </div>
    </div>
  );
}
