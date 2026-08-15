"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  HelpCircle,
  PlayCircle,
  Video,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { useCourse } from "@/src/features/courses/hooks/use-course";
import type {
  CourseLessonTree,
  CourseModuleTree,
} from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import {
  isResourceOnlyLesson,
} from "@/src/features/courses/utils/course-content-stats.util";

interface Props {
  courseId: string;
}

function formatDuration(
  duration: number | null,
  durationType: string | null | undefined,
) {
  if (!duration || !durationType) {
    return null;
  }
  return `${duration} ${durationType.toLowerCase()}`;
}

function getLessonLabel(lesson: CourseLessonTree) {
  if (lesson.quiz) {
    return "Quiz";
  }
  if (lesson.videoUrl?.trim()) {
    return "Self-Paced Video";
  }
  return "Lesson";
}

function ModulePreviewContent({ module }: { module: CourseModuleTree }) {
  const lessons = [...module.lessons].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const learningLessons = lessons.filter(
    (lesson) => !lesson.quiz && !isResourceOnlyLesson(lesson),
  );

  const resources = lessons.flatMap((lesson) =>
    (lesson.resources ?? []).map((resource) => ({
      ...resource,
      lessonTitle: lesson.title,
    })),
  );

  const quizzes = lessons.filter((lesson) => lesson.quiz);

  return (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      {learningLessons.length > 0 ? (
        <ul className="space-y-2">
          {learningLessons.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center gap-2 text-sm text-slate-800"
            >
              {lesson.videoUrl ? (
                <Video className="h-4 w-4 shrink-0 text-blue-600" />
              ) : (
                <BookOpen className="h-4 w-4 shrink-0 text-slate-600" />
              )}
              <span>▶ {lesson.title}</span>
              <span className="text-xs text-slate-500">
                ({getLessonLabel(lesson)})
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {resources.length > 0 ? (
        <ul className="space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center gap-2 text-sm text-slate-800"
            >
              <FileText className="h-4 w-4 shrink-0 text-amber-600" />
              {resource.fileUrl ? (
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#2447A8] hover:underline"
                >
                  {resource.title}
                </a>
              ) : (
                <span>{resource.title}</span>
              )}
              <span className="text-xs text-slate-500">({resource.type})</span>
            </li>
          ))}
        </ul>
      ) : null}

      {quizzes.length > 0 ? (
        <ul className="space-y-2">
          {quizzes.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center gap-2 text-sm text-slate-800"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>📝 {lesson.quiz?.title ?? lesson.title}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex items-center gap-2 text-sm text-slate-400">
        <ClipboardList className="h-4 w-4 shrink-0" />
        <span>Assignments — not available yet</span>
      </div>
    </div>
  );
}

export function CoursePreviewPage({ courseId }: Props) {
  const { course, isLoading, error, refetch } = useCourse(courseId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        description={error ?? "Unable to load course preview."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const modules = [...(course.modules ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const moduleCount = course.moduleCount ?? modules.length;
  const lessonCount =
    course.lessonCount ??
    modules.reduce((total, module) => total + module.lessons.length, 0);

  const durationLabel = formatDuration(
    course.duration,
    course.durationType,
  );

  const isDraft = course.status === "DRAFT";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <Link
        href={`/courses/${courseId}/manage`}
        className="inline-flex items-center text-sm font-medium text-[#2447A8] hover:underline"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Back to Management
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-48 w-full object-cover"
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <PlayCircle className="h-16 w-16 text-slate-400" />
          </div>
        )}

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <CourseStatusBadge
              status={course.status}
              deletedAt={course.deletedAt}
              isDeleted={course.isDeleted}
            />
            {isDraft ? (
              <Badge variant="default">Draft Preview</Badge>
            ) : null}
            <Badge variant="info">{course.level}</Badge>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {course.title}
            </h1>
            {course.tagline ? (
              <p className="mt-2 text-sm text-slate-600">{course.tagline}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {durationLabel ? <span>Duration: {durationLabel}</span> : null}
            <span>
              {moduleCount} module{moduleCount === 1 ? "" : "s"}
            </span>
            <span>
              {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
            </span>
          </div>

          {(course.description || course.shortDescription) && (
            <p className="text-sm leading-relaxed text-slate-700">
              {course.description || course.shortDescription}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Course Content</h2>

        {modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No modules published for preview yet.
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module) => (
              <article
                key={module.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <header>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Module {String(module.displayOrder).padStart(2, "0")}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {module.title}
                  </h3>
                  {module.description ? (
                    <p className="mt-1 text-sm text-slate-500">
                      {module.description}
                    </p>
                  ) : null}
                </header>

                <ModulePreviewContent module={module} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
