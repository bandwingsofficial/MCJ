"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  PlayCircle,
} from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { BatchCourseContent } from "@/src/features/branch-ops/types";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { cn } from "@/src/shared/lib/cn";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface Props {
  batchId: string;
  courseId?: string | null;
}

type CourseItem = BatchCourseContent["courses"][number];
type ModuleItem = BatchCourseContent["modules"][number];
type LessonItem = ModuleItem["lessons"][number];

function formatCourseHeading(
  sessionCode: string | null | undefined,
  title: string,
): string {
  const code = sessionCode?.trim();
  const name = title.trim();
  if (!code) return name;
  return name ? `${code} - ${name}` : code;
}

function formatLessonContentType(type: string) {
  return type.replace(/_/g, " ");
}

function resourceIcon(type: string) {
  if (type === "VIDEO") return PlayCircle;
  if (type === "LINK") return Link2;
  return FileText;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#102A56]">{value}</p>
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  meta,
  defaultOpen = false,
  level = "module",
  children,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  defaultOpen?: boolean;
  level?: "module" | "lesson";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-white",
        level === "module"
          ? "border-[#D7E6F5] shadow-sm"
          : "border-[#E8F0F8] bg-[#FBFDFF]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8FBFF]",
          open && "border-b border-[#E8F0F8] bg-[#F8FBFF]",
        )}
      >
        <span className="mt-0.5 text-[#2563EB]">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-[#102A56]">
            {title}
          </span>
          {subtitle ? (
            <span className="mt-1 block text-sm leading-6 text-[#647A9B]">
              {subtitle}
            </span>
          ) : null}
          {meta ? (
            <span className="mt-1 block text-xs text-[#94A3B8]">{meta}</span>
          ) : null}
        </span>
      </button>
      {open ? <div className="px-4 py-4">{children}</div> : null}
    </div>
  );
}

function LessonSection({
  lesson,
  index,
}: {
  lesson: LessonItem;
  index: number;
}) {
  const noteResources = lesson.resources.filter((resource) =>
    ["DOC", "PDF", "PPT"].includes(resource.type),
  );
  const otherResources = lesson.resources.filter(
    (resource) => !["DOC", "PDF", "PPT"].includes(resource.type),
  );

  return (
    <CollapsibleSection
      level="lesson"
      title={`Lesson ${index + 1}: ${lesson.name}`}
      subtitle={lesson.description}
      meta={
        lesson.duration != null ? `${lesson.duration} min` : undefined
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Order" value={String(index + 1)} />
          {lesson.contentType !== "LESSON" ? (
            <DetailField
              label="Content type"
              value={formatLessonContentType(lesson.contentType)}
            />
          ) : null}
        </div>

        {lesson.videoUrl ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
              Recording / video
            </p>
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:underline"
            >
              <PlayCircle className="h-4 w-4" />
              Open recording
            </a>
          </div>
        ) : null}

        {noteResources.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
              Notes
            </p>
            <ul className="mt-2 space-y-2">
              {noteResources.map((resource) => {
                const Icon = resourceIcon(resource.type);
                const content = (
                  <span className="inline-flex items-center gap-2 text-sm text-[#2563EB]">
                    <Icon className="h-4 w-4" />
                    {resource.title}
                  </span>
                );

                return (
                  <li key={resource.id}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {otherResources.length ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
              Resources
            </p>
            <ul className="mt-2 space-y-2">
              {otherResources.map((resource) => {
                const Icon = resourceIcon(resource.type);
                const content = (
                  <span className="inline-flex items-center gap-2 text-sm text-[#2563EB]">
                    <Icon className="h-4 w-4" />
                    {resource.title}
                    <span className="text-xs text-[#647A9B]">
                      {resource.type}
                    </span>
                  </span>
                );

                return (
                  <li key={resource.id}>
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </CollapsibleSection>
  );
}

function ModuleSection({
  module,
  index,
}: {
  module: ModuleItem;
  index: number;
}) {
  const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order);

  return (
    <CollapsibleSection
      level="module"
      defaultOpen={index === 0}
      title={`Module ${index + 1}: ${module.name}`}
      subtitle={module.description}
      meta={
        module.duration != null
          ? `${module.duration} min · ${sortedLessons.length} lesson${
              sortedLessons.length === 1 ? "" : "s"
            }`
          : `${sortedLessons.length} lesson${
              sortedLessons.length === 1 ? "" : "s"
            }`
      }
    >
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Module order" value={String(index + 1)} />
          {module.duration != null ? (
            <DetailField
              label="Duration"
              value={`${module.duration} min`}
            />
          ) : null}
        </div>

        {!sortedLessons.length ? (
          <p className="text-sm text-[#647A9B]">
            No lessons are available in this module.
          </p>
        ) : (
          sortedLessons.map((lesson, lessonIndex) => (
            <LessonSection
              key={lesson.id}
              lesson={lesson}
              index={lessonIndex}
            />
          ))
        )}
      </div>
    </CollapsibleSection>
  );
}

function CourseHierarchy({
  course,
  modules,
  materials,
}: {
  course: CourseItem;
  modules: ModuleItem[];
  materials: BatchCourseContent["materials"];
}) {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#EFF6FF] p-3 text-[#2563EB]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
              Course
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#102A56]">
              {formatCourseHeading(course.session?.code, course.title)}
            </h2>
            <p className="mt-1 font-mono text-sm text-[#647A9B]">
              {course.code}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {course.category?.name ? (
            <DetailField label="Category" value={course.category.name} />
          ) : null}
          {course.duration ? (
            <DetailField label="Duration" value={course.duration} />
          ) : null}
          {course.session?.number != null ? (
            <DetailField
              label="Session"
              value={`Session ${course.session.number}${
                course.session.code ? ` (${course.session.code})` : ""
              }`}
            />
          ) : null}
        </div>

        {course.description ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
              Description
            </p>
            <p className="mt-2 text-sm leading-7 text-[#334155] whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
        ) : null}

        {materials.length ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
              Course notes & resources
            </p>
            <ul className="mt-3 space-y-2">
              {materials.map((material) => {
                const Icon = resourceIcon(material.type);
                const content = (
                  <span className="inline-flex items-center gap-2 text-sm text-[#2563EB]">
                    <Icon className="h-4 w-4" />
                    {material.title}
                    <span className="text-xs text-[#647A9B]">
                      {material.type}
                    </span>
                  </span>
                );

                return (
                  <li key={material.id}>
                    {material.url ? (
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {content}
                      </a>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-[#102A56]">Modules</h3>
            <p className="mt-1 text-sm text-[#647A9B]">
              Expand a module to browse its lessons in order.
            </p>
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
            {sortedModules.length} module
            {sortedModules.length === 1 ? "" : "s"}
          </p>
        </div>

        {!sortedModules.length ? (
          <EmptyState title="No modules are available for this course." />
        ) : (
          sortedModules.map((module, index) => (
            <ModuleSection key={module.id} module={module} index={index} />
          ))
        )}
      </section>
    </div>
  );
}

export function BatchCoursePanel({ batchId, courseId }: Props) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchCourse(batchId),
    [batchId],
  );

  const assignedCourse = useMemo(() => {
    if (!data?.courses.length) return null;

    if (courseId) {
      return data.courses.find((course) => course.id === courseId) ?? null;
    }

    return data.courses.length === 1 ? data.courses[0] : null;
  }, [courseId, data]);

  const courseModules = useMemo(() => {
    if (!assignedCourse || !data) return [];
    return data.modules.filter(
      (module) => module.courseId === assignedCourse.id,
    );
  }, [assignedCourse, data]);

  const courseMaterials = useMemo(() => {
    if (!assignedCourse || !data) return [];
    return data.materials.filter(
      (material) => material.courseId === assignedCourse.id,
    );
  }, [assignedCourse, data]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!assignedCourse) {
    return <EmptyState title="No course has been assigned to this batch." />;
  }

  return (
    <CourseHierarchy
      course={assignedCourse}
      modules={courseModules}
      materials={courseMaterials}
    />
  );
}
