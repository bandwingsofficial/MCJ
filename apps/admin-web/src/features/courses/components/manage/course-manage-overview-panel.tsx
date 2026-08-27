"use client";

import { useMemo, useState } from "react";
import { FileText, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { truncateText } from "@/src/features/branches/utils/branch-display.utils";
import {
  CourseModuleDeleteDialog,
  CourseModuleStatusBadge,
} from "@/src/features/course-modules/components";
import {
  useCourseModules,
  useDeleteCourseModule,
} from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { CourseOverviewInformation } from "@/src/features/courses/components/manage/course-overview-information";
import { CourseOverviewMetricCards } from "@/src/features/courses/components/manage/course-overview-metric-cards";
import type {
  CourseDetails,
  CourseSummary,
} from "@/src/features/courses/types/course.types";
import {
  computeCourseContentStats,
  getModuleContentCounts,
} from "@/src/features/courses/utils/course-content-stats.util";

interface Props {
  course: CourseDetails;
  summary: CourseSummary | null;
  summaryLoading?: boolean;
  disabled?: boolean;
  onRefresh?: () => Promise<void>;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function ModuleCardSkeleton() {
  return <Skeleton className="h-36 w-full rounded-xl" />;
}

export function CourseManageOverviewPanel({
  course,
  summary,
  summaryLoading = false,
  disabled = false,
  onRefresh,
}: Props) {
  const courseId = course.id;

  const { modules, isLoading: modulesLoading, refetch } = useCourseModules({
    courseId,
    includeDeleted: false,
  });

  const { deleteCourseModule, isSubmitting: isDeletingModule } =
    useDeleteCourseModule();

  const [deleteTarget, setDeleteTarget] = useState<CourseModule | null>(null);

  const moduleTreeById = useMemo(
    () => new Map((course.modules ?? []).map((module) => [module.id, module])),
    [course.modules],
  );

  const sortedModules = useMemo(
    () =>
      [...modules].sort(
        (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
      ),
    [modules],
  );

  const contentStats = useMemo(
    () => computeCourseContentStats(course, summary),
    [course, summary],
  );

  const lessonResources = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      type: string;
      fileUrl: string | null;
      lessonTitle: string;
      moduleTitle: string;
    }> = [];

    for (const module of course.modules ?? []) {
      for (const lesson of module.lessons ?? []) {
        for (const resource of lesson.resources ?? []) {
          items.push({
            id: resource.id,
            title: resource.title,
            type: resource.type,
            fileUrl: resource.fileUrl,
            lessonTitle: lesson.title,
            moduleTitle: module.title,
          });
        }
      }
    }

    return items.sort((a, b) => a.title.localeCompare(b.title));
  }, [course.modules]);

  const getModuleCounts = (module: CourseModule) => {
    const tree = moduleTreeById.get(module.id);
    if (tree) {
      return getModuleContentCounts(tree);
    }

    return { lessons: 0, resources: 0, quizzes: 0, assignments: 0 };
  };

  const handleDeleteModule = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteCourseModule(deleteTarget.id);
      appToast.success("Module deleted successfully");
      setDeleteTarget(null);
      await refetch();
      await onRefresh?.();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    }
  };

  const moduleActionsDisabled = disabled || isDeletingModule;

  return (
    <div className="space-y-6">
      <CourseOverviewInformation course={course} />

      <SectionCard
        title="Course Modules"
        description="Modules included in this course."
      >
        {modulesLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <ModuleCardSkeleton key={index} />
            ))}
          </div>
        ) : sortedModules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-[#647A9B]">
            No modules available
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sortedModules.map((module, index) => {
              const counts = getModuleCounts(module);

              return (
                <div
                  key={module.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-700">
                      {formatContentOrderNumber(
                        module.displayOrder ?? index + 1,
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={moduleActionsDisabled}
                      aria-label="Delete module"
                      className="h-9 w-9 shrink-0 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteTarget(module)}
                    >
                      <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                    </Button>
                  </div>
                  <p className="mt-3 font-semibold text-[#102A56]">
                    {module.title}
                  </p>
                  {module.description?.trim() ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {truncateText(module.description, 72)}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {counts.lessons} lesson{counts.lessons === 1 ? "" : "s"}
                  </p>
                  <div className="mt-3">
                    <CourseModuleStatusBadge module={module} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Course Resources"
        description="Files and materials linked to this course."
      >
        {lessonResources.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-[#647A9B]">
            No resources available
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full border-collapse">
              <thead className="border-b border-slate-200 bg-[#F6F9FD]">
                <tr>
                  {["Resource", "Type", "Module", "Lesson"].map((label) => (
                    <th
                      key={label}
                      className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lessonResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-amber-600" />
                        {resource.fileUrl ? (
                          <a
                            href={resource.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[#2563EB] hover:underline"
                          >
                            {resource.title}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-[#102A56]">
                            {resource.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-slate-700">
                      {resource.type}
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-slate-700">
                      {resource.moduleTitle}
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-slate-700">
                      {resource.lessonTitle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <section>
        <h2 className="mb-4 text-base font-semibold text-[#102A56]">
          Course Content Summary
        </h2>
        <CourseOverviewMetricCards
          stats={contentStats}
          isLoading={summaryLoading || modulesLoading}
        />
      </section>

      <CourseModuleDeleteDialog
        open={deleteTarget !== null}
        moduleTitle={deleteTarget?.title}
        contentCounts={
          deleteTarget ? getModuleCounts(deleteTarget) : undefined
        }
        loading={isDeletingModule}
        onClose={() => {
          if (!isDeletingModule) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleDeleteModule();
        }}
      />
    </div>
  );
}
