"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";

import type {
  BulkCourseOperationResult,
} from "@/src/features/courses/types/course.types";

interface UseBulkPermanentDeleteCoursesReturn {
  bulkPermanentDelete: (
    courseIds: string[]
  ) => Promise<BulkCourseOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteCourses(): UseBulkPermanentDeleteCoursesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDelete = async (courseIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await courseService.bulkPermanentDelete(courseIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete courses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDelete, isPending };
}
