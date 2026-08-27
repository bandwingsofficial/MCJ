"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileText,
  HelpCircle,
  PlayCircle,
  Radio,
  Video,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { useCourse } from "@/src/features/courses/hooks/use-course";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import type { PreviewContentItem } from "@/src/features/courses/utils/course-preview-content.util";
import {
  buildModulePreviewSections,
  formatModuleHeading,
  sortModulesForPreview,
} from "@/src/features/courses/utils/course-preview-content.util";

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

function PreviewIcon({ kind }: { kind: PreviewContentItem["kind"] }) {
  switch (kind) {
    case "self-paced-video":
      return <Video className="h-4 w-4 shrink-0 text-blue-600" />;
    case "live-recorded-video":
      return <Radio className="h-4 w-4 shrink-0 text-violet-600" />;
    case "resource":
      return <FileText className="h-4 w-4 shrink-0 text-amber-600" />;
    case "quiz":
      return <HelpCircle className="h-4 w-4 shrink-0 text-emerald-600" />;
    default:
      return <BookOpen className="h-4 w-4 shrink-0 text-slate-600" />;
  }
}

function PreviewSection({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: PreviewContentItem[];
  emptyMessage: string;
}) {
  return (
    <div className="ml-4 border-l border-slate-200 pl-4">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[#647A9B]">{emptyMessage}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2 text-sm text-slate-800"
            >
              <PreviewIcon kind={item.kind} />
              <div className="min-w-0 flex-1">
                {item.kind === "resource" && item.fileUrl ? (
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2563EB] hover:underline"
                  >
                    {item.title}
                  </a>
                ) : (
                  <span className="font-medium text-[#102A56]">
                    {item.title}
                  </span>
                )}
                <span className="mt-0.5 block text-xs text-slate-500">
                  {item.typeLabel}
                  {item.resourceType ? ` · ${item.resourceType}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
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

  const modules = sortModulesForPreview(course.modules ?? []);
  const moduleCount = course.moduleCount ?? modules.length;
  const lessonCount =
    course.lessonCount ??
    modules.reduce((total, module) => total + module.lessons.length, 0);
  const durationLabel = formatDuration(course.duration, course.durationType);
  const isDraft = course.status === "DRAFT";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <Link
        href={`/courses/${courseId}/manage`}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] hover:underline"
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
            {isDraft ? <Badge variant="default">Draft Preview</Badge> : null}
            <Badge variant="info">{course.level}</Badge>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Course
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#102A56] sm:text-3xl">
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
        <h2 className="text-lg font-semibold text-[#102A56]">Course Content</h2>

        {modules.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-[#647A9B]">
            No modules available for preview yet.
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => {
              const sections = buildModulePreviewSections(module);

              return (
                <article
                  key={module.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <header className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-semibold text-[#102A56]">
                      {formatModuleHeading(module, index)}
                    </h3>
                    {module.description?.trim() ? (
                      <p className="mt-1 text-sm text-[#647A9B]">
                        {module.description.trim()}
                      </p>
                    ) : null}
                  </header>

                  <div className="mt-4 space-y-5">
                    <PreviewSection
                      title="Lessons"
                      items={sections.lessons}
                      emptyMessage="No lessons available yet."
                    />
                    <PreviewSection
                      title="Self-Paced Videos"
                      items={sections.selfPacedVideos}
                      emptyMessage="No self-paced videos available yet."
                    />
                    <PreviewSection
                      title="Live Recorded Videos"
                      items={sections.liveRecordedVideos}
                      emptyMessage="No live recorded videos available yet."
                    />
                    <PreviewSection
                      title="Resources"
                      items={sections.resources}
                      emptyMessage="No resources available yet."
                    />
                    <PreviewSection
                      title="Quizzes"
                      items={sections.quizzes}
                      emptyMessage="No quizzes available yet."
                    />
                    <div className="ml-4 border-l border-slate-200 pl-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Assignments
                      </h4>
                      <p className="mt-2 flex items-center gap-2 text-sm text-[#647A9B]">
                        <ClipboardList className="h-4 w-4 shrink-0" />
                        No assignments available yet.
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
