"use client";

import { useQuery } from "@tanstack/react-query";

import { batchService } from "@/src/features/batches/services/batch.service";
import { isBatchBlockedForSelection } from "@/src/features/enrollments/utils/enrollment-batch.utils";
import { getCourses } from "@/src/features/courses/services/course.service";
import { loadBranchAssignedTrainers } from "@/src/features/branches/utils/branch-trainer.utils";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

export function useBranchCourses(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch-courses", branchId],
    queryFn: () => getCourses({ branchId }),
    enabled: Boolean(branchId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}

export function useBranchBatches(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch-batches", branchId],
    queryFn: () => batchService.getAllBatches({ branchId }),
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBranchTrainers(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch-trainers", branchId],
    queryFn: () => loadBranchAssignedTrainers(branchId!),
    enabled: Boolean(branchId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}

export function useBranchStats(branchId: string | undefined) {
  const batchesQuery = useBranchBatches(branchId);

  const stats = (() => {
    const batches = (batchesQuery.data ?? []).filter(
      (batch) => !batch.isDeleted,
    );
    const studentsTrained = batches.reduce(
      (total, batch) => total + (batch.enrolledCount ?? 0),
      0,
    );
    const activeBatches = batches.filter(
      (batch) => !isBatchBlockedForSelection(batch),
    ).length;

    return [
      {
        label: "Students Trained",
        value: studentsTrained > 0 ? `${studentsTrained}+` : "—",
      },
      {
        label: "Active Batches",
        value: activeBatches > 0 ? String(activeBatches) : "—",
      },
      {
        label: "Flexible Batches",
        value:
          activeBatches > 0
            ? "Weekdays & Weekends"
            : "Contact for schedule",
      },
    ];
  })();

  return {
    stats,
    isLoading: batchesQuery.isLoading,
    isError: batchesQuery.isError,
  };
}
