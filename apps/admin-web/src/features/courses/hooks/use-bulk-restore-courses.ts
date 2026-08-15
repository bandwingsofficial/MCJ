"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { courseService } from "@/src/features/courses/services/course.service";

import type {
  BulkCourseOperationResult,
} from "@/src/features/courses/types/course.types";

interface UseBulkRestoreCoursesReturn {
  bulkRestore: (
    courseIds: string[]
  ) => Promise<BulkCourseOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreCourses(): UseBulkRestoreCoursesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestore = async (courseIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await courseService.bulkRestore(courseIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore courses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestore, isPending };
}
