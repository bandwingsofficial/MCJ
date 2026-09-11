"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  FileQuestion,
  FileText,
  Hash,
  HelpCircle,
  Layers,
  PlayCircle,
  Radio,
  Tag,
  Video,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { cn } from "@/src/shared/lib/cn";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

import {
  isLiveRecordedVideoLesson,
  isPlainLesson,
  isSelfPacedVideoLesson,
  resolveLessonContentType,
} from "@/src/features/course-modules/utils/module-content.utils";
import { LessonPreviewAccessBadge } from "@/src/features/course-lessons/components/lesson-preview-access-badge";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import type {
  CourseLessonTree,
  CourseModuleTree,
} from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import {
  computeCourseContentStats,
  getModuleContentCounts,
  isResourceOnlyLesson,
} from "@/src/features/courses/utils/course-content-stats.util";
import type { PreviewContentKind } from "@/src/features/courses/utils/course-preview-content.util";
import {
  sortModulesForPreview,
} from "@/src/features/courses/utils/course-preview-content.util";

interface Props {
  courseId: string;
}

const MODULE_ACCENTS = [
  {
    card: "border-[#C7D9F5] bg-[#F8FBFF]",
    badge: "bg-[#2563EB] text-white",
    chip: "bg-blue-50 text-[#2563EB] ring-blue-100",
    icon: "text-[#2563EB]",
    body: "bg-[#EFF6FF] border-[#BFDBFE]",
  },
  {
    card: "border-violet-200 bg-violet-50/50",
    badge: "bg-violet-600 text-white",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: "text-violet-600",
    body: "bg-violet-50/80 border-violet-200",
  },
  {
    card: "border-teal-200 bg-teal-50/40",
    badge: "bg-teal-600 text-white",
    chip: "bg-teal-50 text-teal-700 ring-teal-100",
    icon: "text-teal-600",
    body: "bg-teal-50/70 border-teal-200",
  },
  {
    card: "border-amber-200 bg-amber-50/40",
    badge: "bg-amber-600 text-white",
    chip: "bg-amber-50 text-amber-800 ring-amber-100",
    icon: "text-amber-700",
    body: "bg-amber-50/70 border-amber-200",
  },
] as const;

const METRIC_CARD_HEIGHT = "h-[5.5rem]";

function getPreviewKind(lesson: CourseLessonTree): PreviewContentKind {
  if (lesson.quiz) {
    return "quiz";
  }
  if (isLiveRecordedVideoLesson(lesson)) {
    return "live-recorded-video";
  }
  if (isSelfPacedVideoLesson(lesson)) {
    return "self-paced-video";
  }
  if (isResourceOnlyLesson(lesson)) {
    return "resource";
  }
  if (isPlainLesson(lesson) || resolveLessonContentType(lesson) === "LESSON") {
    return "lesson";
  }
  return "lesson";
}

function getPreviewTypeLabel(kind: PreviewContentKind): string {
  switch (kind) {
    case "self-paced-video":
      return "Self-Paced Video";
    case "live-recorded-video":
      return "Live Recorded Video";
    case "resource":
      return "Resource";
    case "quiz":
      return "Quiz";
    default:
      return "Lesson";
  }
}

function PreviewIcon({ kind }: { kind: PreviewContentKind }) {
  switch (kind) {
    case "self-paced-video":
      return <Video className="h-4 w-4 shrink-0 text-sky-600" aria-hidden="true" />;
    case "live-recorded-video":
      return <Radio className="h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />;
    case "resource":
      return <FileText className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />;
    case "quiz":
      return <HelpCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />;
    default:
      return <BookOpen className="h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden="true" />;
  }
}

function SummaryMetricCard({
  label,
  value,
  icon: Icon,
  iconClass,
  iconBgClass,
  cardClass,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}) {
  return (
    <div
      className={cn(
        METRIC_CARD_HEIGHT,
        "w-full rounded-xl border p-3 shadow-sm",
        cardClass,
      )}
    >
      <div className="flex h-full items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold tabular-nums leading-none tracking-tight text-[#102A56]">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
            iconBgClass,
          )}
        >
          <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function ModuleStatusBadge({ module }: { module: CourseModuleTree }) {
  const hasContent = (module.lessons?.length ?? 0) > 0;
  const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

  if (!hasContent) {
    return (
      <Badge variant="default" className={compactClass}>
        No Content
      </Badge>
    );
  }

  return (
    <Badge variant="success" className={compactClass}>
      Available
    </Badge>
  );
}

function LessonPreviewRow({
  lesson,
  accentBody,
}: {
  lesson: CourseLessonTree;
  accentBody: string;
}) {
  const kind = getPreviewKind(lesson);
  const typeLabel = getPreviewTypeLabel(kind);
  const orderLabel = formatContentOrderNumber(lesson.displayOrder);
  const resources = [...(lesson.resources ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <li className="rounded-lg border border-white/80 bg-white/70 px-3 py-2.5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold tabular-nums text-[#647A9B] ring-1 ring-[#DCE8F5]">
          {orderLabel}
        </span>
        <PreviewIcon kind={kind} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-sm font-medium text-[#102A56]">{lesson.title}</p>
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {kind !== "quiz" ? (
                <LessonPreviewAccessBadge isPreview={lesson.isPreview} />
              ) : lesson.quiz?.status === "PUBLISHED" ? (
                <Badge
                  variant="success"
                  className="px-2 py-0 text-[11px] font-semibold leading-5"
                >
                  Published
                </Badge>
              ) : null}
            </div>
          </div>
          <p className="mt-0.5 text-xs text-[#647A9B]">{typeLabel}</p>
        </div>
      </div>

      {resources.length > 0 ? (
        <ul className={cn("mt-2.5 space-y-1.5 border-t border-white/80 pt-2.5 pl-10", accentBody)}>
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-start gap-2 text-xs text-slate-700"
            >
              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div className="min-w-0">
                {resource.fileUrl ? (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2563EB] hover:underline"
                  >
                    {resource.title}
                  </a>
                ) : (
                  <span className="font-medium text-[#102A56]">
                    {resource.title}
                  </span>
                )}
                <span className="mt-0.5 block text-[#647A9B]">
                  Resource · {resource.type}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function ModulePreviewAccordionItem({
  module,
  index,
}: {
  module: CourseModuleTree;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];
  const orderLabel = formatContentOrderNumber(module.displayOrder ?? index + 1);
  const counts = getModuleContentCounts(module);
  const sortedLessons = [...(module.lessons ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm transition-shadow",
        accent.card,
        open && "ring-2 ring-[#DCE8F5]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
            accent.badge,
          )}
        >
          {orderLabel}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Module {orderLabel}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#102A56]">
                {module.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge
                variant="info"
                className={cn("px-2.5 py-0.5 text-[10px] ring-1", accent.chip)}
              >
                {counts.lessons} lesson{counts.lessons === 1 ? "" : "s"}
              </Badge>
              <ModuleStatusBadge module={module} />
            </div>
          </div>

          {module.description?.trim() && !open ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#647A9B]">
              {module.description.trim()}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE8F5] bg-white",
            accent.icon,
          )}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-white/70 px-4 pb-4 pt-1">
          <div className={cn("rounded-xl border px-3 py-3", accent.body)}>
            {module.description?.trim() ? (
              <p className="mb-3 text-sm leading-relaxed text-[#647A9B]">
                {module.description.trim()}
              </p>
            ) : null}

            {sortedLessons.length === 0 ? (
              <p className="text-sm text-[#647A9B]">No lessons available yet.</p>
            ) : (
              <ul className="space-y-2">
                {sortedLessons.map((lesson) => (
                  <LessonPreviewRow
                    key={lesson.id}
                    lesson={lesson}
                    accentBody={accent.body}
                  />
                ))}
              </ul>
            )}

            <p className="mt-3 flex items-center gap-2 border-t border-white/70 pt-3 text-xs text-[#647A9B]">
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Assignments are not available in preview yet.
            </p>
          </div>
        </div>
      ) : null}
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
  const stats = computeCourseContentStats(course, null);
  const categoryName = getCourseCategoryDisplayName(course);
  const isDraft = course.status === "DRAFT";
  const description =
    course.description?.trim() ||
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    null;

  const summaryMetrics = [
    {
      key: "modules",
      label: "Modules",
      value: stats.modules,
      icon: Layers,
      iconClass: "text-[#2563EB]",
      iconBgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "lessons",
      label: "Lessons",
      value: stats.lessons,
      icon: BookOpen,
      iconClass: "text-violet-600",
      iconBgClass: "bg-violet-50/90 ring-violet-100/80",
      cardClass:
        "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
    },
    {
      key: "resources",
      label: "Resources",
      value: stats.resources,
      icon: FileText,
      iconClass: "text-amber-700",
      iconBgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      value: stats.quizzes,
      icon: FileQuestion,
      iconClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "preview",
      label: "Preview Lessons",
      value: course.previewLessonCount ?? 0,
      icon: PlayCircle,
      iconClass: "text-sky-600",
      iconBgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    },
  ];

  return (
    <div className="mx-auto min-h-full max-w-5xl space-y-4 px-4 py-5 sm:px-6">
      <Link
        href={`/courses/${courseId}/manage`}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Back to Management
      </Link>

      <section className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB]">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-start">
            <div className="shrink-0">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  width={160}
                  height={160}
                  className="h-36 w-full rounded-xl border border-[#DCE8F5] object-cover shadow-sm md:h-40 md:w-40"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-[#DCE8F5] bg-gradient-to-br from-slate-50 to-[#F8FBFF] md:h-40 md:w-40">
                  <PlayCircle className="h-12 w-12 text-slate-400" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CourseStatusBadge
                  status={course.status}
                  deletedAt={course.deletedAt}
                  isDeleted={course.isDeleted}
                />
                {isDraft ? (
                  <Badge
                    variant="default"
                    className="px-2 py-0 text-[11px] font-semibold leading-5"
                  >
                    Draft Preview
                  </Badge>
                ) : null}
                {course.level ? (
                  <Badge
                    variant="info"
                    className="px-2 py-0 text-[11px] font-semibold leading-5"
                  >
                    {course.level}
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#102A56] sm:text-3xl">
                {course.title}
              </h1>

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="flex items-start gap-2 rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <Hash className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                      Course Code
                    </dt>
                    <dd className="font-mono text-sm font-medium text-[#102A56]">
                      {course.code ?? course.slug}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                      Category
                    </dt>
                    <dd className="text-sm font-medium text-[#102A56]">
                      {categoryName}
                    </dd>
                  </div>
                </div>
              </dl>

              {description ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-2.5">
          <h2 className="text-base font-semibold text-[#102A56]">Course Summary</h2>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Overview of course content available in this preview.
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
            {summaryMetrics.map(({ key, ...metric }) => (
              <SummaryMetricCard key={key} {...metric} />
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="border-b border-[#E1EBF5] bg-gradient-to-r from-[#F8FBFF] to-white px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#102A56]">
                  Course Modules
                </h2>
                <p className="mt-0.5 text-sm text-[#647A9B]">
                  Expand a module to preview its lessons and materials.
                </p>
              </div>
            </div>
            <Badge variant="info" className="px-3 py-1 text-xs">
              {modules.length} module{modules.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 bg-[#FAFCFF] p-4">
          {modules.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
              <h3 className="text-base font-semibold text-[#102A56]">
                No Modules Found
              </h3>
              <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                No modules are available for preview yet.
              </p>
            </div>
          ) : (
            modules.map((module, index) => (
              <ModulePreviewAccordionItem
                key={module.id}
                module={module}
                index={index}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
