"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { enrollmentService } from "../services/enrollment.service";
import { parseEnrollmentListResponse } from "../utils/enrollment-list.utils";
import { isEnrollmentVisibleInAdminList } from "../utils/enrollment-workflow-status.utils";

import {
  Enrollment,
  EnrollmentFilters,
  SortOrder,
} from "../types";
import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";

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
            await enrollmentService.getEnrollments({
              ...filters,
              status: undefined,
            });

          const parsed = parseEnrollmentListResponse(response);

          const visibleItems = parsed.items.filter((enrollment) =>
            isEnrollmentVisibleInAdminList({
              enrollmentStatus: enrollment.status,
              studentStatus: enrollment.student?.status,
            }),
          );

          setEnrollments(visibleItems);
          setCount(visibleItems.length);
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

    useRealtimeRefetch("enrollment", fetchEnrollments);
    useRealtimeRefetch("student", fetchEnrollments);

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