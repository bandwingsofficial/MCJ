"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";

import type {
  BulkCourseOperationResult,
} from "@/src/features/courses/types/course.types";

interface UseBulkDeleteCoursesReturn {
  bulkDelete: (
    courseIds: string[]
  ) => Promise<BulkCourseOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteCourses(): UseBulkDeleteCoursesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDelete = async (courseIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await courseService.bulkDelete(courseIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete courses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDelete, isPending };
}
