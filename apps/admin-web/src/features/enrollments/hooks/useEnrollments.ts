"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { enrollmentService } from "../services/enrollment.service";
import { parseEnrollmentListResponse } from "../utils/enrollment-list.utils";

import {
  Enrollment,
  EnrollmentFilters,
  SortOrder,
} from "../types";

interface UseEnrollmentsReturn {
  enrollments: Enrollment[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: EnrollmentFilters;

  setFilters: (
    filters: EnrollmentFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const useEnrollments =
  (): UseEnrollmentsReturn => {
    const [
      enrollments,
      setEnrollments,
    ] = useState<Enrollment[]>([]);

    const [count, setCount] =
      useState(0);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(
        null,
      );

    const [filters, setFilters] =
      useState<EnrollmentFilters>({
        skip: 0,
take: 10,
        search: "",
        status: undefined,
        paymentStatus:
          undefined,
        branchId: undefined,
        batchId: undefined,
        courseId: undefined,
        isActive: undefined,
        sortBy: "createdAt",
        sortOrder:
          SortOrder.DESC,
      });

    const fetchEnrollments =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await enrollmentService.getEnrollments(
              filters,
            );

          const parsed = parseEnrollmentListResponse(response);

          setEnrollments(parsed.items);
          setCount(parsed.total);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch enrollments";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchEnrollments();
    }, [fetchEnrollments]);

    return {
      enrollments,
      count,
      isLoading,
      error,
      filters,
      setFilters,
      refetch:
        fetchEnrollments,
    };
  };