"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBranch } from "@/src/features/branches/hooks/use-branch";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { BranchLiveRecordedBreadcrumbs } from "@/src/features/branches/components/live-recorded/branch-live-recorded-breadcrumbs";
import { branchLiveRecordedBatchPath } from "@/src/features/branches/utils/branch-live-recorded.routes";
import { batchIsAssignedToBranch } from "@/src/features/branches/utils/branch-batch-assignment.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { ModuleLiveRecordedVideosTab } from "@/src/features/course-modules/components/manage/module-live-recorded-videos-tab";
import {
  formatLessonOrderLabel,
  formatModuleOrderLabel,
} from "@/src/features/course-lessons/utils/lesson-order.utils";

interface Props {
  branchId: string;
  batchId: string;
  moduleId: string;
  lessonId: string;
}

export function BranchLiveRecordedLessonPage({
  branchId,
  batchId,
  moduleId,
  lessonId,
}: Props) {
  const { branch, isLoading: branchLoading } = useBranch(branchId);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [module, setModule] = useState<CourseModule | null>(null);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = batch?.courseId ?? batch?.course?.id ?? null;
  const { course, isLoading: courseLoading } = useCourse(courseId ?? "");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [batchResponse, moduleResponse, lessonResponse] = await Promise.all([
        batchService.getBatch(batchId),
        courseModuleService.getCourseModule(moduleId),
        courseLessonService.getCourseLesson(lessonId),
      ]);

      const loadedBatch = batchResponse.data;
      const loadedModule = moduleResponse.data;
      const loadedLesson = lessonResponse.data;

      if (!batchIsAssignedToBranch(loadedBatch, branchId)) {
        setError("This batch is not assigned to the selected branch.");
        return;
      }

      const resolvedCourseId =
        loadedBatch.courseId ?? loadedBatch.course?.id ?? null;

      if (!resolvedCourseId || loadedModule.courseId !== resolvedCourseId) {
        setError("This module does not belong to the batch course.");
        return;
      }

      if (loadedLesson.moduleId !== moduleId) {
        setError("This lesson does not belong to the selected module.");
        return;
      }

      setBatch(loadedBatch);
      setModule(loadedModule);
      setLesson(loadedLesson);
    } catch (err) {
      setError(getErrorMessage(err));
      setBatch(null);
      setModule(null);
      setLesson(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, branchId, lessonId, moduleId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (branchLoading || loading) {
    return <Loader />;
  }

  if (error || !branch || !batch || !module || !lesson) {
    return (
      <ErrorState
        title="Lesson Not Available"
        description={error ?? "Unable to load this lesson."}
        onRetry={() => {
          void loadData();
        }}
      />
    );
  }

  if (!courseId || courseLoading) {
    return <Loader />;
  }

  if (!course) {
    return (
      <ErrorState
        title="Course Not Found"
        description="Unable to load the course for this lesson."
      />
    );
  }

  const batchCourseHref = branchLiveRecordedBatchPath(branchId, batchId);
  const branchManageHref = `/branches/${branchId}`;

  return (
    <div className="min-h-full space-y-4">
      <Link
        href={batchCourseHref}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Back to Course
      </Link>

      <BranchLiveRecordedBreadcrumbs
        items={[
          { label: "Branches", href: "/branches" },
          {
            label: `${branch.branchName} (${branch.branchCode})`,
            href: branchManageHref,
          },
          { label: "Live Recorded Videos", href: branchManageHref },
          { label: batch.name, href: batchCourseHref },
          { label: course.title, href: batchCourseHref },
          { label: module.title, href: batchCourseHref },
          { label: lesson.title },
          { label: "Live Recorded Videos" },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Module
            </p>
            <h2 className="mt-1 text-base font-semibold text-[#102A56]">
              {module.title}
            </h2>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Module {formatModuleOrderLabel(module.displayOrder)}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Lesson
            </p>
            <h1 className="mt-1 text-lg font-semibold text-[#102A56] sm:text-xl">
              {lesson.title}
            </h1>
            <p className="mt-0.5 text-sm text-[#647A9B]">
              Lesson {formatLessonOrderLabel(lesson.displayOrder || 1)}
            </p>
          </div>
        </div>
      </div>

      <ModuleLiveRecordedVideosTab
        moduleId={moduleId}
        parentLessonId={lessonId}
        liveRecordedScope={{ branchId, batchId }}
      />
    </div>
  );
}
