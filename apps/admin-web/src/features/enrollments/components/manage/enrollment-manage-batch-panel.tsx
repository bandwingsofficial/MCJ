"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { toAssignmentCourseDisplayTitles } from "@/src/features/batches/utils/batch-course.utils";
import { BranchBatchAssignDetails } from "@/src/features/branches/components/manage/branch-batch-assign-details";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentCategoryName } from "@/src/features/students/utils/enrollment-display.utils";

interface Props {
  enrollment: Enrollment;
}

export function EnrollmentManageBatchPanel({ enrollment }: Props) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [courseTitles, setCourseTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const batchId = enrollment.batch?.id;
    if (!batchId) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const [batchResponse, assignments] = await Promise.all([
          batchService.getBatch(batchId),
          batchService.getBatchCourses(batchId),
        ]);
        setBatch(batchResponse.data);
        setCourseTitles(
          toAssignmentCourseDisplayTitles(
            assignments,
            enrollment.course?.title ?? batchResponse.data.course?.title,
          ),
        );
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBatch(null);
        setCourseTitles([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [enrollment.batch?.id, enrollment.course?.title]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  if (!batch) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
        <p className="text-sm font-medium text-slate-700">
          Batch details are not available
        </p>
      </div>
    );
  }

  return (
    <BranchBatchAssignDetails
      batch={batch}
      courseTitles={courseTitles.length ? courseTitles : undefined}
      categoryName={formatEnrollmentCategoryName(enrollment)}
    />
  );
}
