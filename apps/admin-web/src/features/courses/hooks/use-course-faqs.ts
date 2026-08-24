"use client";

import { useCallback, useEffect, useState } from "react";

import { courseFaqService } from "@/src/features/courses/services/course-faq.service";
import type { CourseFaq } from "@/src/features/courses/types/course-faq.types";

export function useCourseFaqs(courseId?: string) {
  const [faqs, setFaqs] = useState<CourseFaq[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setFaqs([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await courseFaqService.list(courseId);
      setFaqs(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load course FAQs",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    faqs,
    isLoading,
    error,
    refetch,
    setFaqs,
  };
}
