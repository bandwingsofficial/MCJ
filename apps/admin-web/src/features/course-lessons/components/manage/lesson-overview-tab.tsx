"use client";

import { Card } from "@/src/shared/components/ui/card";

import { LessonPreviewAccessBadge } from "@/src/features/course-lessons/components/lesson-preview-access-badge";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type {
  ModuleQuizRow,
  ModuleResourceRow,
} from "@/src/features/course-modules/hooks/use-module-content-data";
import {
  formatLessonOrderLabel,
  formatModuleOrderLabel,
} from "@/src/features/course-lessons/utils/lesson-order.utils";

interface Props {
  module: CourseModule;
  lesson: CourseLesson;
  lessonPosition: number;
  resources: ModuleResourceRow[];
  quizzes: ModuleQuizRow[];
  selfPacedCount: number;
  liveRecordedCount: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-[#102A56]">
        {value}
      </p>
    </div>
  );
}

export function LessonOverviewTab({
  module,
  lesson,
  lessonPosition,
  resources,
  quizzes,
  selfPacedCount,
  liveRecordedCount,
}: Props) {
  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Parent Module
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Module Name
            </dt>
            <dd className="mt-1 text-sm text-[#102A56]">{module.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Module Number
            </dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {formatModuleOrderLabel(module.displayOrder)}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#102A56]">
          Lesson Information
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Title
            </dt>
            <dd className="mt-1 text-sm text-[#102A56]">{lesson.title}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Lesson Number
            </dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {formatLessonOrderLabel(lessonPosition)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Preview Access
            </dt>
            <dd className="mt-1">
              <LessonPreviewAccessBadge isPreview={lesson.isPreview} />
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {lesson.description?.trim() || "—"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#102A56]">Content Summary</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Self-Paced Videos" value={selfPacedCount} />
          <StatCard label="Live Recorded Videos" value={liveRecordedCount} />
          <StatCard label="Resources" value={resources.length} />
          <StatCard label="Quizzes" value={quizzes.length} />
          <StatCard label="Assignments" value={0} />
        </div>
      </Card>
    </div>
  );
}
