"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentFilters } from "@/src/features/enrollments/types/enrollment.filters";
import { SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";

const DEFAULT_PAGE_SIZE = 10;

interface UseStudentEnrollmentsOptions {
  studentId: string;
  pageSize?: number;
}

interface UseStudentEnrollmentsReturn {
  enrollments: Enrollment[];
  total: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  includeDeleted: boolean;
  setPage: (page: number) => void;
  setIncludeDeleted: (value: boolean) => void;
  refetch: () => Promise<void>;
}

export function useStudentEnrollments({
  studentId,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseStudentEnrollmentsOptions): UseStudentEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    if (!studentId) {
      setEnrollments([]);
      setTotal(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const filters: EnrollmentFilters = {
        studentId,
        skip: (page - 1) * pageSize,
        take: pageSize,
        sortBy: "createdAt",
        sortOrder: SortOrder.DESC,
        includeDeleted,
      };

      const response = await enrollmentService.getEnrollments(filters);
      const parsed = parseEnrollmentListResponse(response);

      setEnrollments(parsed.items);
      setTotal(parsed.total);
    } catch (err) {
      setError(getErrorMessage(err));
      setEnrollments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, page, pageSize, includeDeleted]);

  useEffect(() => {
    void fetchEnrollments();
  }, [fetchEnrollments]);

  useEffect(() => {
    setPage(1);
  }, [studentId, includeDeleted]);

  return {
    enrollments,
    total,
    isLoading,
    error,
    page,
    pageSize,
    includeDeleted,
    setPage,
    setIncludeDeleted,
    refetch: fetchEnrollments,
  };
}
