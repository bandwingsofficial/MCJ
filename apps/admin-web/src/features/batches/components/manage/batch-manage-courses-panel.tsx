"use client";

import Link from "next/link";
import { ExternalLink, FileText, Pencil } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import type {
  CourseLessonTree,
  CourseModuleTree,
  CourseResourceTree,
} from "@/src/features/courses/types/course.types";

interface Props {
  batch: Batch;
}

function sortByDisplayOrder<T extends { displayOrder: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function formatLessonMeta(lesson: CourseLessonTree): string {
  const parts: string[] = [];

  if (lesson.contentType) {
    parts.push(lesson.contentType.replace(/_/g, " "));
  }

  if (lesson.duration != null && lesson.duration > 0) {
    parts.push(`${lesson.duration} min`);
  }

  if (lesson.isPreview) {
    parts.push("Preview");
  }

  return parts.join(" · ");
}

function ResourcesList({ resources }: { resources: CourseResourceTree[] }) {
  const sorted = sortByDisplayOrder(resources);

  if (sorted.length === 0) {
    return (
      <p className="mt-2 text-xs text-slate-500">
        No resources for this lesson.
      </p>
    );
  }

  return (
    <ul className="mt-2 space-y-1.5">
      {sorted.map((resource) => (
        <li
          key={resource.id}
          className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
        >
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#102A56]">
              {resource.title}
            </p>
            <p className="text-xs text-slate-500">
              {resource.type?.trim() || "Resource"}
            </p>
          </div>
          {resource.fileUrl ? (
            <a
              href={resource.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-[#2563EB] hover:underline"
              aria-label={`Open ${resource.title}`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function LessonBlock({ lesson }: { lesson: CourseLessonTree }) {
  const meta = formatLessonMeta(lesson);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#102A56]">{lesson.title}</p>
        {meta ? <p className="mt-0.5 text-xs text-slate-500">{meta}</p> : null}
      </div>
      <div className="mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Resources
        </p>
        <ResourcesList resources={lesson.resources ?? []} />
      </div>
    </div>
  );
}

function ModuleLessons({ module }: { module: CourseModuleTree }) {
  const lessons = sortByDisplayOrder(module.lessons ?? []);

  if (lessons.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-[#647A9B]">
        No lessons in this module.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Lessons ({lessons.length})
      </p>
      {lessons.map((lesson) => (
        <LessonBlock key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}

export function BatchManageCoursesPanel({ batch }: Props) {
  const courseId = batch.courseId?.trim() ?? "";
  const { course, isLoading, error, refetch } = useCourse(courseId);

  if (!courseId) {
    return (
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#102A56]">Course</h2>
            <p className="mt-1 text-sm text-[#647A9B]">
              The course is assigned when you create or edit this batch.
            </p>
          </div>
          <Link
            href={`/batches/${batch.id}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm font-medium text-[#102A56] hover:bg-[#F8FBFF]"
          >
            <Pencil className="h-3.5 w-3.5" />
            Assign course
          </Link>
        </div>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <p className="text-sm font-medium text-[#102A56]">
            No course assigned — edit this batch to select a course
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-slate-200/80 p-8 shadow-sm">
        <Loader />
      </Card>
    );
  }

  if (error || !course) {
    return (
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <ErrorState
          title="Failed to load course"
          description={error ?? "Unable to load the assigned course content."}
          onRetry={() => {
            void refetch();
          }}
        />
      </Card>
    );
  }

  const modules = sortByDisplayOrder(course.modules ?? []);
  const moduleCount = course.moduleCount ?? modules.length;
  const lessonCount =
    course.lessonCount ??
    modules.reduce((total, module) => total + (module.lessons?.length ?? 0), 0);

  return (
    <div className="space-y-4">
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#102A56]">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-[#647A9B]">
              {[
                course.code?.trim() || null,
                course.categoryName?.trim() ||
                  course.category?.name?.trim() ||
                  null,
                `${moduleCount} module${moduleCount === 1 ? "" : "s"}`,
                `${lessonCount} lesson${lessonCount === 1 ? "" : "s"}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {course.shortDescription?.trim() || course.description?.trim() ? (
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
                {course.shortDescription?.trim() || course.description?.trim()}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/courses/${course.id}/manage`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm font-medium text-[#102A56] hover:bg-[#F8FBFF]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View course
            </Link>
            <Link
              href={`/batches/${batch.id}/edit`}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm font-medium text-[#102A56] hover:bg-[#F8FBFF]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Change course
            </Link>
          </div>
        </div>
      </Card>

      {modules.length === 0 ? (
        <Card className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-[#102A56]">
            No modules in this course yet.
          </p>
          <p className="mt-1 text-sm text-[#647A9B]">
            Add modules on the Course manage page to see them here.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-[#102A56]">
              Modules ({modules.length})
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Content is loaded from the assigned course. Expanding a module
              shows its lessons and resources.
            </p>
          </div>

          <Accordion type="multiple" className="px-4">
            {modules.map((module, index) => {
              const lessonTotal = module.lessons?.length ?? 0;

              return (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold text-[#102A56]">
                        Module {index + 1}: {module.title}
                      </p>
                      <p className="mt-0.5 text-xs font-normal text-slate-500">
                        {lessonTotal} lesson{lessonTotal === 1 ? "" : "s"}
                        {module.description?.trim()
                          ? ` · ${module.description.trim()}`
                          : ""}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ModuleLessons module={module} />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </Card>
      )}
    </div>
  );
}
