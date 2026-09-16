"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  PlayCircle,
  Radio,
} from "lucide-react";

import { LessonResourcesList } from "@/src/features/learning/components/lesson/lesson-content-panels";
import type {
  LessonQuizDto,
  LessonResourceDto,
  LessonVideoDto,
} from "@/src/features/learning/types/learning.types";
import {
  getLessonQuizPath,
  getLessonRecordingPath,
} from "@/src/features/learning/utils/routes.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
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
  title?: string;
  duration: number | null;
  contentType: string;
}

export function RecordedVideoCard({
  courseId,
  lessonId,
  title = "Watch the lesson recording",
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
                {title}
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

interface RecordedVideosSectionProps {
  courseId: string;
  parentLessonId: string;
  parentTitle: string;
  videoUrl: string | null;
  duration: number | null;
  contentType: string;
  selfPacedVideos: LessonVideoDto[];
}

export function RecordedVideosSection({
  courseId,
  parentLessonId,
  parentTitle,
  videoUrl,
  duration,
  contentType,
  selfPacedVideos,
}: RecordedVideosSectionProps) {
  const videos = [
    ...(videoUrl
      ? [
          {
            id: parentLessonId,
            title: parentTitle,
            duration,
            contentType,
          },
        ]
      : []),
    ...selfPacedVideos
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .filter((video) => Boolean(video.videoUrl)),
  ];

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-sky-50 p-2 text-sky-600">
          <PlayCircle className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[#0B1F3A]">
          Recorded Video
        </h2>
      </div>
      <div className="space-y-3">
        {videos.map((video) => (
          <RecordedVideoCard
            key={video.id}
            courseId={courseId}
            lessonId={video.id}
            title={video.title}
            duration={video.duration}
            contentType={video.contentType}
          />
        ))}
      </div>
    </section>
  );
}

interface LiveRecordedVideosSectionProps {
  courseId: string;
  videos: LessonVideoDto[];
}

export function LiveRecordedVideosSection({
  courseId,
  videos,
}: LiveRecordedVideosSectionProps) {
  const orderedVideos = videos
    .slice()
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .filter((video) => Boolean(video.videoUrl));

  if (orderedVideos.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
          <Radio className="h-4 w-4" />
        </div>
        <h2 className="text-base font-semibold text-[#0B1F3A]">
          Live Recorded Video
        </h2>
      </div>
      <div className="space-y-3">
        {orderedVideos.map((video) => {
          const durationLabel = formatDuration(video.duration);

          return (
            <Link
              key={video.id}
              href={getLessonRecordingPath(courseId, video.id)}
              className="group block"
            >
              <Card className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 p-5 shadow-sm transition hover:border-rose-200 hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                      <Radio className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-700">
                        Live Recording
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-[#0B1F3A]">
                        {video.title}
                      </h3>
                      {video.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {video.description}
                        </p>
                      ) : null}
                      {durationLabel ? (
                        <p className="mt-1 text-sm text-slate-500">
                          Duration: {durationLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white transition group-hover:bg-rose-700">
                    Watch Live Recording
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
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
      <LessonResourcesList
        resources={resources}
        courseId={courseId}
        hideEmptyState
      />
    </section>
  );
}

interface QuizSectionProps {
  courseId: string;
  lessonId: string;
  quiz: LessonQuizDto;
  latestAttempt?: {
    percentage: number;
    passed: boolean;
  } | null;
}

export function QuizSection({
  courseId,
  lessonId,
  quiz,
  latestAttempt,
}: QuizSectionProps) {
  if (quiz.status !== "PUBLISHED") {
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-600">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0B1F3A]">{quiz.title}</h3>
              {quiz.description ? (
                <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
              ) : null}
              <p className="mt-2 text-sm text-slate-600">
                Practice assessment · {quiz.questionCount} question
                {quiz.questionCount === 1 ? "" : "s"}
                {quiz.passingScore != null
                  ? ` · Passing score: ${quiz.passingScore}%`
                  : ""}
                {quiz.timeLimitMinutes
                  ? ` · Time limit: ${quiz.timeLimitMinutes} min`
                  : ""}
              </p>
              {latestAttempt ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={latestAttempt.passed ? "success" : "warning"}>
                    {latestAttempt.passed ? "Passed" : "Attempted"} ·{" "}
                    {latestAttempt.percentage}%
                  </Badge>
                </div>
              ) : null}
            </div>
          </div>
          <Link href={getLessonQuizPath(courseId, lessonId)}>
            <Button className="rounded-lg bg-violet-600 hover:bg-violet-700">
              {latestAttempt ? "Retake Quiz" : "Start Quiz"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
