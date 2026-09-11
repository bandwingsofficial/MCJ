"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  CourseModuleDeleteDialog,
} from "@/src/features/course-modules/components";
import {
  useCourseModules,
  useDeleteCourseModule,
} from "@/src/features/course-modules/hooks";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import { CourseOverviewInformation } from "@/src/features/courses/components/manage/course-overview-information";
import { CourseOverviewMetricCards } from "@/src/features/courses/components/manage/course-overview-metric-cards";
import { CourseOverviewModulesAccordion } from "@/src/features/courses/components/manage/course-overview-modules-accordion";
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
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
        ) : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InlineEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
      <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#647A9B]">{description}</p>
    </div>
  );
}

function ModuleAccordionSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#E1EBF5] bg-gradient-to-r from-[#F8FBFF] to-white px-5 py-4">
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="space-y-3 bg-[#FAFCFF] p-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
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
    <div className="space-y-4">
      <section>
        <h2 className="mb-3 text-base font-semibold text-[#102A56]">
          Course Content Summary
        </h2>
        <CourseOverviewMetricCards
          stats={contentStats}
          isLoading={summaryLoading || modulesLoading}
        />
      </section>

      <CourseOverviewInformation course={course} />

      {modulesLoading ? (
        <ModuleAccordionSkeleton />
      ) : sortedModules.length === 0 ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
          <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
            <h2 className="text-base font-semibold text-[#102A56]">
              Course Modules
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Modules included in this course.
            </p>
          </div>
          <div className="p-4">
            <InlineEmptyState
              title="No modules available"
              description="Add modules from the Modules tab to build course content."
            />
          </div>
        </div>
      ) : (
        <CourseOverviewModulesAccordion
          modules={sortedModules}
          getModuleCounts={getModuleCounts}
          actionsDisabled={moduleActionsDisabled}
          onDelete={setDeleteTarget}
        />
      )}

      <SectionCard
        title="Course Resources"
        description="Files and materials linked to this course."
      >
        {lessonResources.length === 0 ? (
          <InlineEmptyState
            title="No resources available"
            description="Resources appear here once they are added to course lessons."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E1EBF5]">
            <table className="min-w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  {["Resource", "Type", "Module", "Lesson"].map((label) => (
                    <th
                      key={label}
                      className="!px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]"
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
                    className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                  >
                    <td className="!px-4 !py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4 shrink-0 text-amber-600"
                          aria-hidden="true"
                        />
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
                    <td className="!px-4 !py-3 align-middle text-sm text-slate-700">
                      {resource.type}
                    </td>
                    <td className="!px-4 !py-3 align-middle text-sm text-slate-700">
                      {resource.moduleTitle}
                    </td>
                    <td className="!px-4 !py-3 align-middle text-sm text-slate-700">
                      {resource.lessonTitle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

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
