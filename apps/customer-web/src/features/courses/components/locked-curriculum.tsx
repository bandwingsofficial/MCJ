"use client";

import { Lock } from "lucide-react";

import type { CoursePreviewModule } from "@/src/features/courses/types/course.types";

interface Props {
  modules: CoursePreviewModule[];
  moduleCount?: number;
  lessonCount?: number;
}

function formatModuleNumber(order: number): string {
  return String(order).padStart(2, "0");
}

export function LockedCurriculum({
  modules,
  moduleCount,
  lessonCount,
}: Props) {
  if (!modules.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Curriculum coming soon
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Course modules and lessons will be listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
        <span>{moduleCount ?? modules.length} modules</span>
        <span>{lessonCount ?? modules.reduce((t, m) => t + m.lessons.length, 0)} lessons</span>
        <span className="inline-flex items-center gap-1 text-indigo-600">
          <Lock className="h-3.5 w-3.5" />
          All content locked
        </span>
      </div>

      <div className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  Module {formatModuleNumber(module.displayOrder)}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {module.lessons.length} lesson
                  {module.lessons.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            </div>

            {module.lessons.length > 0 ? (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
                  >
                    <p className="text-sm text-slate-700">
                      <span className="font-medium text-slate-500">
                        {formatModuleNumber(lesson.displayOrder)}.
                      </span>{" "}
                      {lesson.title}
                    </p>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
