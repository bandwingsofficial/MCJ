"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";

import type {
  BulkCourseOperationResult,
} from "@/src/features/courses/types/course.types";

interface UseBulkDeactivateCoursesReturn {
  bulkDeactivate: (
    courseIds: string[]
  ) => Promise<BulkCourseOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeactivateCourses(): UseBulkDeactivateCoursesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDeactivate = async (courseIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await courseService.bulkDeactivate(courseIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to deactivate courses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDeactivate, isPending };
}
