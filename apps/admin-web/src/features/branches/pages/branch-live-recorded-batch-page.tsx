"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBranch } from "@/src/features/branches/hooks/use-branch";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { BranchLiveRecordedBreadcrumbs } from "@/src/features/branches/components/live-recorded/branch-live-recorded-breadcrumbs";
import { BranchLiveRecordedBatchHeader } from "@/src/features/branches/components/live-recorded/branch-live-recorded-batch-header";
import {
  BranchLiveRecordedModuleAccordion,
  type BranchLiveRecordedModuleData,
} from "@/src/features/branches/components/live-recorded/branch-live-recorded-module-accordion";
import { batchIsAssignedToBranch } from "@/src/features/branches/utils/branch-batch-assignment.utils";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseModuleListItem } from "@/src/features/course-modules/types/course-module.types";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import { filterNormalLessons } from "@/src/features/course-modules/hooks/use-module-content-data";
import { isPlainLesson } from "@/src/features/course-modules/utils/module-content.utils";

interface Props {
  branchId: string;
  batchId: string;
}

function buildLiveCountMap(
  liveLessons: CourseLesson[],
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of liveLessons) {
    if (row.isDeleted || !row.parentLessonId) {
      continue;
    }

    const current = counts.get(row.parentLessonId) ?? 0;
    counts.set(row.parentLessonId, current + 1);
  }

  return counts;
}

function countPlainLessons(lessons: CourseLesson[]): number {
  const emptyQuiz = new Set<string>();
  const emptyShell = new Set<string>();
  return filterNormalLessons(lessons, emptyQuiz, emptyShell).filter(
    (lesson) => isPlainLesson(lesson) && !lesson.isDeleted,
  ).length;
}

export function BranchLiveRecordedBatchPage({ branchId, batchId }: Props) {
  const { branch, isLoading: branchLoading } = useBranch(branchId);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [modules, setModules] = useState<BranchLiveRecordedModuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const courseId = batch?.courseId ?? batch?.course?.id ?? null;
  const { course, isLoading: courseLoading } = useCourse(courseId ?? "");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const batchResponse = await batchService.getBatch(batchId);
      const loadedBatch = batchResponse.data;

      if (!batchIsAssignedToBranch(loadedBatch, branchId)) {
        setError("This batch is not assigned to the selected branch.");
        setBatch(null);
        setModules([]);
        return;
      }

      const resolvedCourseId =
        loadedBatch.courseId ?? loadedBatch.course?.id ?? null;

      if (!resolvedCourseId) {
        setError("This batch has no course assigned.");
        setBatch(loadedBatch);
        setModules([]);
        return;
      }

      setBatch(loadedBatch);

      const modulesResponse = await courseModuleService.getCourseModules({
        courseId: resolvedCourseId,
        includeDeleted: false,
      });

      const moduleItems = modulesResponse.data ?? [];
      const modulesWithData = await Promise.all(
        moduleItems.map(async (module: CourseModuleListItem) => {
          const [lessonsResponse, liveResponse] = await Promise.all([
            courseLessonService.getCourseLessons({
              moduleId: module.id,
              includeDeleted: false,
            }),
            courseLessonService.getCourseLessons({
              moduleId: module.id,
              contentType: "LIVE_RECORDED_VIDEO",
              branchId,
              batchId,
              includeDeleted: false,
            }),
          ]);

          return {
            module,
            lessons: lessonsResponse.data ?? [],
            liveCountByLessonId: buildLiveCountMap(liveResponse.data ?? []),
          };
        }),
      );

      setModules(modulesWithData);
    } catch (err) {
      setError(getErrorMessage(err));
      setBatch(null);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [batchId, branchId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    let lessonCount = 0;
    let liveVideoCount = 0;
    let lessonsWithLive = 0;

    for (const entry of modules) {
      lessonCount += countPlainLessons(entry.lessons);

      for (const count of entry.liveCountByLessonId.values()) {
        liveVideoCount += count;
        if (count > 0) {
          lessonsWithLive += 1;
        }
      }
    }

    return {
      moduleCount: modules.length,
      lessonCount,
      liveVideoCount,
      lessonsWithLive,
    };
  }, [modules]);

  if (branchLoading || loading) {
    return <Loader />;
  }

  if (error || !branch || !batch) {
    return (
      <ErrorState
        title="Batch Not Available"
        description={error ?? "Unable to load this batch."}
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
        description="Unable to load the course for this batch."
      />
    );
  }

  const branchManageHref = `/branches/${branchId}`;

  return (
    <div className="min-h-full space-y-3">
      <Link
        href={branchManageHref}
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Back to Branch
      </Link>

      <BranchLiveRecordedBreadcrumbs
        items={[
          { label: "Branches", href: "/branches" },
          {
            label: `${branch.branchName} (${branch.branchCode})`,
            href: branchManageHref,
          },
          { label: "Live Recorded Videos", href: branchManageHref },
          { label: batch.name },
          { label: course.title },
        ]}
      />

      <BranchLiveRecordedBatchHeader
        courseTitle={course.title}
        courseCode={course.code}
        batch={batch}
        moduleCount={summary.moduleCount}
        lessonCount={summary.lessonCount}
        liveVideoCount={summary.liveVideoCount}
      />

      <BranchLiveRecordedModuleAccordion
        branchId={branchId}
        batchId={batchId}
        modules={modules}
      />
    </div>
  );
}
