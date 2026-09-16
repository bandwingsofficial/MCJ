"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, PlayCircle } from "lucide-react";

import { LessonResourcesList } from "@/src/features/learning/components/lesson/lesson-content-panels";
import type {
  LessonQuizDto,
  LessonResourceDto,
} from "@/src/features/learning/types/learning.types";
import { getLessonRecordingPath } from "@/src/features/learning/utils/routes.utils";
import { Card } from "@/src/shared/components/ui/card";

function formatDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return remainingSeconds > 0
    ? `${minutes} min ${remainingSeconds}s`
    : `${minutes} min`;
}

interface RecordedVideoCardProps {
  courseId: string;
  lessonId: string;
  duration: number | null;
  contentType: string;
}

export function RecordedVideoCard({
  courseId,
  lessonId,
  duration,
  contentType,
}: RecordedVideoCardProps) {
  const durationLabel = formatDuration(duration);

  return (
    <Link
      href={getLessonRecordingPath(courseId, lessonId)}
      className="group block"
    >
      <Card className="rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-blue-50 p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
                Recorded Video
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0B1F3A]">
                Watch the lesson recording
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {durationLabel
                  ? `Duration: ${durationLabel}`
                  : `Format: ${contentType.replace(/_/g, " ").toLowerCase()}`}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition group-hover:bg-sky-700">
            Watch Recording
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

interface ResourcesSectionProps {
  resources: LessonResourceDto[];
  courseId: string;
}

export function ResourcesSection({
  resources,
  courseId,
}: ResourcesSectionProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <FileText className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[#0B1F3A]">
          Resources / Notes
        </h2>
      </div>
      <LessonResourcesList resources={resources} courseId={courseId} hideEmptyState />
    </section>
  );
}

interface QuizSectionProps {
  quiz: LessonQuizDto | null;
}

export function QuizSection({ quiz }: QuizSectionProps) {
  if (!quiz) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[#0B1F3A]">Quiz / Practice</h2>
      </div>
      <Card className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0B1F3A]">{quiz.title}</h3>
            <p className="mt-1 text-sm text-slate-600">
              Status: {quiz.status}
              {quiz.passingScore != null
                ? ` · Passing score: ${quiz.passingScore}%`
                : ""}
              {quiz.timeLimitMinutes
                ? ` · Time limit: ${quiz.timeLimitMinutes} min`
                : ""}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Quiz attempts are not available in the LMS yet. Contact your
              trainer if this assessment is required.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
