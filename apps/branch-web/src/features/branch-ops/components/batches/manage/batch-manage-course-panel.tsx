"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Link2,
  PlayCircle,
} from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  BatchCourseContent,
  BatchListItem,
} from "@/src/features/branch-ops/types";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

import { BatchManageEmptyMessage, BatchManageSection } from "./batch-manage-section";

interface Props {
  batch: BatchListItem;
}

type CourseModule = BatchCourseContent["modules"][number];
type CourseLesson = CourseModule["lessons"][number];
type CourseResource = CourseLesson["resources"][number];

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

function ResourcesList({ resources }: { resources: CourseResource[] }) {
  if (resources.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-500">No resources for this lesson.</p>
    );
  }

  return (
    <ul className="mt-2 space-y-1.5">
      {resources.map((resource) => {
        const Icon = resourceIcon(resource.type);

        return (
          <li
            key={resource.id}
            className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#102A56]">
                {resource.title}
              </p>
              <p className="text-xs text-slate-500">
                {resource.type?.trim() || "Resource"}
              </p>
            </div>
            {resource.url ? (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-[#2563EB] hover:underline"
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

function LessonBlock({ lesson }: { lesson: CourseLesson }) {
  const meta = formatLessonMeta(lesson);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#102A56]">
          {lesson.order + 1}. {lesson.name}
        </p>
        {lesson.description?.trim() ? (
          <p className="mt-1 text-sm text-slate-600">{lesson.description}</p>
        ) : null}
        {meta ? <p className="mt-0.5 text-xs text-slate-500">{meta}</p> : null}
      </div>

      {lesson.videoUrl ? (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Recording / Video
          </p>
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
          >
            <PlayCircle className="h-4 w-4" />
            Open lesson video
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}

      <div className="mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Resources / Notes
        </p>
        <ResourcesList resources={lesson.resources ?? []} />
      </div>
    </div>
  );
}

function ModuleLessons({ module }: { module: CourseModule }) {
  const lessons = sortByOrder(module.lessons ?? []);

  if (lessons.length === 0) {
    return (
      <BatchManageEmptyMessage message="No lessons in this module." />
    );
  }

  return (
    <div className="space-y-3 pb-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Lessons ({lessons.length})
      </p>
      {lessons.map((lesson) => (
        <LessonBlock key={lesson.id} lesson={lesson} />
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

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 pr-3">
          <p className="text-sm font-semibold text-[#102A56]">
            Module {index + 1}: {module.name}
          </p>
          <p className="mt-0.5 text-xs font-normal text-slate-500">
            {lessonTotal} lesson{lessonTotal === 1 ? "" : "s"}
            {module.description?.trim()
              ? ` · ${module.description.trim()}`
              : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="pb-4">
          <ModuleLessons module={module} />
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
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-[#102A56]">
          Modules ({sorted.length})
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Expand a module to view its lessons, recordings, and resources.
        </p>
      </div>
      <div className="px-4">
        {sorted.map((module, index) => (
          <ModuleAccordionItem key={module.id} module={module} index={index} />
        ))}
      </div>
    </Card>
  );
}

function CourseHeader({
  course,
}: {
  course: BatchCourseContent["courses"][number];
}) {
  const moduleLabel = course.duration?.trim()
    ? `Duration: ${course.duration}`
    : null;

  return (
    <BatchManageSection title="Course">
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="min-w-0 sm:col-span-2 lg:col-span-3">
          <dt className="text-xs text-slate-500">Course name</dt>
          <dd className="mt-0.5 text-sm font-semibold text-[#102A56]">
            {formatCourseHeading(course.session?.code, course.title)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">Course code</dt>
          <dd className="mt-0.5 font-mono text-sm font-medium text-[#102A56]">
            {course.code}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-slate-500">Category</dt>
          <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
            {course.category?.name?.trim() || "—"}
          </dd>
        </div>
        {moduleLabel ? (
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">Duration</dt>
            <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
              {course.duration}
            </dd>
          </div>
        ) : null}
        {course.description?.trim() ? (
          <div className="min-w-0 sm:col-span-2 lg:col-span-3">
            <dt className="text-xs text-slate-500">Description</dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-slate-600">
              {course.description}
            </dd>
          </div>
        ) : null}
      </dl>
    </BatchManageSection>
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
    <BatchManageSection title="Course resources">
      <ul className="space-y-2">
        {courseMaterials.map((material) => {
          const Icon = resourceIcon(material.type);

          return (
            <li key={material.id}>
              {material.url ? (
                <a
                  href={material.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
                >
                  <Icon className="h-4 w-4" />
                  {material.title}
                  <span className="text-xs text-[#647A9B]">{material.type}</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-[#102A56]">
                  <Icon className="h-4 w-4" />
                  {material.title}
                  <span className="text-xs text-[#647A9B]">{material.type}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </BatchManageSection>
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
    <div className="space-y-4">
      {courses.map((course) => {
        const modules = sortByOrder(
          data.modules.filter((module) => module.courseId === course.id),
        );
        const lessonCount = modules.reduce(
          (total, module) => total + (module.lessons?.length ?? 0),
          0,
        );

        return (
          <div key={course.id} className="space-y-4">
            <CourseHeader course={course} />

            <Card className="rounded-xl border border-slate-200/80 px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-500">
                {modules.length} module{modules.length === 1 ? "" : "s"} ·{" "}
                {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
              </p>
            </Card>

            <CourseModulesAccordion modules={modules} />
            <CourseMaterials materials={data.materials} courseId={course.id} />
          </div>
        );
      })}
    </div>
  );
}
