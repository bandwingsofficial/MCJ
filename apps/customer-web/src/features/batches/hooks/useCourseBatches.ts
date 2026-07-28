"use client";

import { useMemo } from "react";

import { useBatches } from "./useBatches";

export function useCourseBatches(courseSlug: string) {
  const {
    batches,
    isLoading,
    error,
    refetch,
  } = useBatches();

  const courseBatches = useMemo(() => {
    return batches.filter(
      (batch: any) =>
        batch.courseSlug === courseSlug ||
        batch.course?.slug === courseSlug
    );
  }, [batches, courseSlug]);

  return {
    batches: courseBatches,
    isLoading,
    error,
    refetch,
  };
}