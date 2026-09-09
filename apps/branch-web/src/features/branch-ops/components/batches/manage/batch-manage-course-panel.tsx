"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  Layers,
  Link2,
  PlayCircle,
  StickyNote,
  Tag,
} from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchCourseContent,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

import { BatchManageEmptyMessage } from "./batch-manage-section";

interface Props {
  batch: BatchListItem;
}

type CourseModule = BatchCourseContent["modules"][number];
type CourseLesson = CourseModule["lessons"][number];
type CourseResource = CourseLesson["resources"][number];

const MODULE_ACCENTS = [
  {
    card: "border-[#C7D9F5] bg-[#F8FBFF]",
    badge: "bg-[#2563EB] text-white",
    chip: "bg-blue-50 text-[#2563EB] ring-blue-100",
    icon: "text-[#2563EB]",
    lessonsBg: "bg-[#EFF6FF] border-[#BFDBFE]",
  },
  {
    card: "border-violet-200 bg-violet-50/50",
    badge: "bg-violet-600 text-white",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: "text-violet-600",
    lessonsBg: "bg-violet-50/80 border-violet-200",
  },
  {
    card: "border-teal-200 bg-teal-50/40",
    badge: "bg-teal-600 text-white",
    chip: "bg-teal-50 text-teal-700 ring-teal-100",
    icon: "text-teal-600",
    lessonsBg: "bg-teal-50/70 border-teal-200",
  },
] as const;

function formatCourseHeading(
  sessionCode: string | null | undefined,
  title: string,
): string {
  const code = sessionCode?.trim();
  const name = title.trim();
  if (!code) return name;
  return name ? `${code} - ${name}` : code;
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function resourceIcon(type: string) {
  if (type === "VIDEO") return PlayCircle;
  if (type === "LINK") return Link2;
  return FileText;
}

function resourceBadgeVariant(
  type: string,
): "info" | "success" | "warning" | "default" {
  if (type === "VIDEO") return "info";
  if (type === "LINK") return "success";
  if (type === "NOTE" || type === "NOTES") return "warning";
  return "default";
}

function formatLessonMeta(lesson: CourseLesson): string {
  const parts: string[] = [];

  if (lesson.contentType) {
    parts.push(lesson.contentType.replace(/_/g, " "));
  }

  if (lesson.duration != null && lesson.duration > 0) {
    parts.push(`${lesson.duration} min`);
  }

  return parts.join(" · ");
}

function ResourceTypeBadge({ type }: { type: string }) {
  const label = type?.trim() || "Resource";
  return (
    <Badge variant={resourceBadgeVariant(type)} className="px-2 py-0.5 text-[10px]">
      {label}
    </Badge>
  );
}

function ResourcesList({ resources }: { resources: CourseResource[] }) {
  if (resources.length === 0) {
    return (
      <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-white/70 px-3 py-2 text-xs text-[#647A9B]">
        No resources for this lesson.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-2">
      {resources.map((resource) => {
        const Icon = resourceIcon(resource.type);

        return (
          <li
            key={resource.id}
            className="flex min-w-0 items-start gap-3 rounded-xl border border-[#E1EBF5] bg-white px-3 py-2.5 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FBFF]">
              <Icon className={`h-4 w-4 ${resource.type === "VIDEO" ? "text-[#2563EB]" : "text-[#647A9B]"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium text-[#102A56]">
                  {resource.title}
                </p>
                <ResourceTypeBadge type={resource.type} />
              </div>
            </div>
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#DCE8F5] bg-[#F8FBFF] text-[#2563EB] transition-colors hover:bg-blue-50"
                aria-label={`Open ${resource.title}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function LessonBlock({
  lesson,
  displayNumber,
}: {
  lesson: CourseLesson;
  displayNumber: number;
}) {
  const meta = formatLessonMeta(lesson);
  const resourceCount = lesson.resources?.length ?? 0;

  return (
    <article className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="flex gap-3 border-b border-[#EEF4FA] px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-semibold text-white">
          {displayNumber}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#102A56]">{lesson.name}</h4>
            <div className="flex flex-wrap gap-1.5">
              {lesson.videoUrl ? (
                <Badge variant="info" className="gap-1 px-2 py-0.5 text-[10px]">
                  <PlayCircle className="h-3 w-3" />
                  Video
                </Badge>
              ) : null}
              {resourceCount > 0 ? (
                <Badge variant="default" className="gap-1 px-2 py-0.5 text-[10px]">
                  <StickyNote className="h-3 w-3" />
                  {resourceCount} resource{resourceCount === 1 ? "" : "s"}
                </Badge>
              ) : null}
            </div>
          </div>
          {lesson.description?.trim() ? (
            <p className="mt-1 text-sm leading-relaxed text-[#647A9B]">
              {lesson.description}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              {lesson.contentType ? (
                <Badge variant="default" className="px-2 py-0.5 text-[10px]">
                  {lesson.contentType.replace(/_/g, " ")}
                </Badge>
              ) : null}
              {lesson.duration != null && lesson.duration > 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration} min
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 border-t border-[#EEF4FA] bg-[#FAFCFF] px-4 py-3">
        {lesson.videoUrl ? (
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              <PlayCircle className="h-3.5 w-3.5 text-[#2563EB]" />
              Recording / Video
            </p>
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#BFDBFE] bg-blue-50 px-3 py-2 text-sm font-medium text-[#2563EB] transition-colors hover:bg-blue-100"
            >
              <PlayCircle className="h-4 w-4" />
              Open lesson video
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          </div>
        ) : null}

        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            <StickyNote className="h-3.5 w-3.5 text-[#647A9B]" />
            Resources / Notes
          </p>
          <ResourcesList resources={lesson.resources ?? []} />
        </div>
      </div>
    </article>
  );
}

function ModuleLessons({
  module,
  accent,
}: {
  module: CourseModule;
  accent: (typeof MODULE_ACCENTS)[number];
}) {
  const lessons = sortByOrder(module.lessons ?? []);

  if (lessons.length === 0) {
    return (
      <div className={`rounded-xl border px-3 py-2 ${accent.lessonsBg}`}>
        <BatchManageEmptyMessage message="No lessons in this module." />
      </div>
    );
  }

  return (
    <div
      className={`space-y-3 rounded-xl border px-3 py-3 ${accent.lessonsBg}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/80 pb-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
          <BookOpen className={`h-3.5 w-3.5 ${accent.icon}`} />
          Lessons
        </p>
        <Badge variant="info" className="px-2 py-0.5 text-[10px]">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
        </Badge>
      </div>
      {lessons.map((lesson) => (
        <LessonBlock
          key={lesson.id}
          lesson={lesson}
          displayNumber={lesson.order + 1}
        />
      ))}
    </div>
  );
}

function ModuleAccordionItem({
  module,
  index,
}: {
  module: CourseModule;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const lessonTotal = module.lessons?.length ?? 0;
  const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm transition-shadow ${accent.card} ${
        open ? "ring-2 ring-[#DCE8F5]" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${accent.badge}`}
        >
          {index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                Module {index + 1}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#102A56]">
                {module.name}
              </p>
            </div>
            <Badge
              variant="info"
              className={`shrink-0 px-2.5 py-0.5 text-[10px] ring-1 ${accent.chip}`}
            >
              {lessonTotal} lesson{lessonTotal === 1 ? "" : "s"}
            </Badge>
          </div>

          {module.description?.trim() ? (
            <p className="mt-2 text-sm leading-relaxed text-[#647A9B]">
              {module.description}
            </p>
          ) : null}
        </div>

        <div
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE8F5] bg-white ${accent.icon}`}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-white/70 px-4 pb-4 pt-1">
          <ModuleLessons module={module} accent={accent} />
        </div>
      ) : null}
    </div>
  );
}

function CourseModulesAccordion({ modules }: { modules: CourseModule[] }) {
  const sorted = sortByOrder(modules);

  if (sorted.length === 0) {
    return (
      <Card className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center shadow-sm">
        <p className="text-sm font-medium text-[#102A56]">
          No modules in this course yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] shadow-sm">
      <div className="border-b border-[#E1EBF5] bg-gradient-to-r from-[#F8FBFF] to-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#102A56]">Modules</h3>
              <p className="mt-0.5 text-sm text-[#647A9B]">
                Expand a module to view its lessons, recordings, and resources.
              </p>
            </div>
          </div>
          <Badge variant="info" className="px-3 py-1 text-xs">
            {sorted.length} module{sorted.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>
      <div className="space-y-3 bg-[#FAFCFF] p-4">
        {sorted.map((module, index) => (
          <ModuleAccordionItem key={module.id} module={module} index={index} />
        ))}
      </div>
    </Card>
  );
}

function CourseSummaryStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof BookOpen;
  tone: "blue" | "violet" | "teal";
}) {
  const tones = {
    blue: "border-[#C7D9F5] bg-[#F8FBFF] text-[#2563EB]",
    violet: "border-violet-200 bg-violet-50/60 text-violet-700",
    teal: "border-teal-200 bg-teal-50/60 text-teal-700",
  };

  return (
    <div className={`rounded-xl border px-3 py-2.5 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">
          {label}
        </p>
      </div>
      <p className="mt-1 text-sm font-semibold text-[#102A56]">{value}</p>
    </div>
  );
}

function CourseHeader({
  course,
  moduleCount,
  lessonCount,
}: {
  course: BatchCourseContent["courses"][number];
  moduleCount: number;
  lessonCount: number;
}) {
  return (
    <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] shadow-sm">
      <div className="border-b border-[#E1EBF5] bg-gradient-to-r from-[#2563EB]/10 via-[#F8FBFF] to-white px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Assigned course
            </p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#102A56]">
              {formatCourseHeading(course.session?.code, course.title)}
            </h2>
            <p className="mt-1 font-mono text-sm text-[#647A9B]">{course.code}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <CourseSummaryStat
          label="Category"
          value={course.category?.name?.trim() || "—"}
          icon={Tag}
          tone="blue"
        />
        <CourseSummaryStat
          label="Duration"
          value={course.duration?.trim() || "—"}
          icon={Clock}
          tone="violet"
        />
        <CourseSummaryStat
          label="Modules"
          value={String(moduleCount)}
          icon={Layers}
          tone="teal"
        />
        <CourseSummaryStat
          label="Lessons"
          value={String(lessonCount)}
          icon={BookOpen}
          tone="blue"
        />
      </div>

      {course.description?.trim() ? (
        <div className="border-t border-[#EEF4FA] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Description
          </p>
          <p className="mt-2 rounded-xl border border-[#E1EBF5] bg-[#FAFCFF] px-4 py-3 text-sm leading-relaxed text-[#334155]">
            {course.description}
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function CourseMaterials({
  materials,
  courseId,
}: {
  materials: BatchCourseContent["materials"];
  courseId: string;
}) {
  const courseMaterials = materials.filter((item) => item.courseId === courseId);

  if (courseMaterials.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#E1EBF5] bg-[#FAFCFF] px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <FolderOpen className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#102A56]">Course resources</h3>
          <p className="text-xs text-[#647A9B]">
            Shared materials linked to this course
          </p>
        </div>
      </div>
      <ul className="space-y-2 p-4">
        {courseMaterials.map((material) => {
          const Icon = resourceIcon(material.type);
          const content = (
            <>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8FBFF]">
                <Icon className="h-4 w-4 text-[#2563EB]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#102A56]">
                  {material.title}
                </p>
                <ResourceTypeBadge type={material.type} />
              </div>
            </>
          );

          return (
            <li key={material.id}>
              {material.url ? (
                <a
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-[#E1EBF5] bg-white px-3 py-2.5 transition-colors hover:border-[#BFDBFE] hover:bg-[#F8FBFF]"
                >
                  {content}
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#2563EB]" />
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-[#E1EBF5] bg-white px-3 py-2.5">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function BatchManageCoursePanel({ batch }: Props) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchCourse(batch.id),
    [batch.id],
  );

  const courses = useMemo(() => {
    if (!data?.courses.length) {
      return [];
    }

    if (batch.course?.id) {
      const primary = data.courses.find((course) => course.id === batch.course?.id);
      return primary ? [primary] : data.courses;
    }

    return data.courses;
  }, [batch.course?.id, data?.courses]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data || courses.length === 0) {
    return <EmptyState title="No course has been assigned to this batch." />;
  }

  return (
    <div className="space-y-5">
      {courses.map((course) => {
        const modules = sortByOrder(
          data.modules.filter((module) => module.courseId === course.id),
        );
        const lessonCount = modules.reduce(
          (total, module) => total + (module.lessons?.length ?? 0),
          0,
        );

        return (
          <div key={course.id} className="space-y-5">
            <CourseHeader
              course={course}
              moduleCount={modules.length}
              lessonCount={lessonCount}
            />
            <CourseModulesAccordion modules={modules} />
            <CourseMaterials materials={data.materials} courseId={course.id} />
          </div>
        );
      })}
    </div>
  );
}
