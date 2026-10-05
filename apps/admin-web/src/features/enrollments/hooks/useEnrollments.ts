"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { enrollmentService } from "../services/enrollment.service";
import { parseEnrollmentListResponse } from "../utils/enrollment-list.utils";

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

  refetch: (override?: Partial<EnrollmentFilters>) => Promise<void>;
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

    const skipNextFilterEffectRef = useRef(false);
    const requestIdRef = useRef(0);
    const filtersRef = useRef<EnrollmentFilters>({
      skip: 0,
      take: 10,
      search: "",
      adminTab: "active",
      paymentStatus: undefined,
      branchId: undefined,
      batchId: undefined,
      courseId: undefined,
      isActive: undefined,
      sortBy: "createdAt",
      sortOrder: SortOrder.DESC,
    });

    const [filters, setFilters] =
      useState<EnrollmentFilters>(filtersRef.current);

    useEffect(() => {
      filtersRef.current = filters;
    }, [filters]);

    const fetchEnrollments =
      useCallback(async (override?: Partial<EnrollmentFilters>) => {
        const activeFilters = {
          ...filtersRef.current,
          ...override,
        };
        const requestId = ++requestIdRef.current;

        try {
          setIsLoading(true);
          setError(null);

          const response =
            await enrollmentService.getEnrollments({
              ...activeFilters,
              status: undefined,
            });

          if (requestId !== requestIdRef.current) {
            return;
          }

          const parsed = parseEnrollmentListResponse(response);

          setEnrollments(parsed.items);
          setCount(parsed.total);

          if (override) {
            skipNextFilterEffectRef.current = true;
            filtersRef.current = activeFilters;
            setFilters(activeFilters);
          }
        } catch (error) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch enrollments";

          setError(message);
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      }, []);

    useEffect(() => {
      if (skipNextFilterEffectRef.current) {
        skipNextFilterEffectRef.current = false;
        return;
      }

      void fetchEnrollments();
    }, [filters, fetchEnrollments]);

    useRealtimeRefetch("enrollment", fetchEnrollments);
    useRealtimeRefetch("student", fetchEnrollments);

    return {
      enrollments,
      count,
      isLoading,
      error,
      filters,
      setFilters,
      refetch: fetchEnrollments,
    };
  };
