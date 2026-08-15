"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";

import type {
  BulkCourseOperationResult,
} from "@/src/features/courses/types/course.types";

interface UseBulkActivateCoursesReturn {
  bulkActivate: (
    courseIds: string[]
  ) => Promise<BulkCourseOperationResult | null>;
  isPending: boolean;
}

export function useBulkActivateCourses(): UseBulkActivateCoursesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkActivate = async (courseIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await courseService.bulkActivate(courseIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate courses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkActivate, isPending };
}
