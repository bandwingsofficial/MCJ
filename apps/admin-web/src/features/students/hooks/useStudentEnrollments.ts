"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import type { EnrollmentFilters } from "@/src/features/enrollments/types/enrollment.filters";
import { SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import type { StudentManageEnrollmentTab } from "@mcj/shared-constants";

import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";

const DEFAULT_PAGE_SIZE = 10;

interface UseStudentEnrollmentsOptions {
  studentId: string;
  pageSize?: number;
  enrollmentTab?: StudentManageEnrollmentTab;
}

export interface StudentEnrollmentsFetchOverride {
  enrollmentTab?: StudentManageEnrollmentTab;
  page?: number;
  includeDeleted?: boolean;
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
  refetch: (override?: StudentEnrollmentsFetchOverride) => Promise<void>;
}

export function useStudentEnrollments({
  studentId,
  pageSize = DEFAULT_PAGE_SIZE,
  enrollmentTab = "all",
}: UseStudentEnrollmentsOptions): UseStudentEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const skipNextEffectRef = useRef(false);
  const requestIdRef = useRef(0);
  const enrollmentTabRef = useRef(enrollmentTab);
  const pageRef = useRef(page);
  const includeDeletedRef = useRef(includeDeleted);

  useEffect(() => {
    enrollmentTabRef.current = enrollmentTab;
  }, [enrollmentTab]);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    includeDeletedRef.current = includeDeleted;
  }, [includeDeleted]);

  const fetchEnrollments = useCallback(
    async (override?: StudentEnrollmentsFetchOverride) => {
      if (!studentId) {
        setEnrollments([]);
        setTotal(0);
        return;
      }

      const activeTab =
        override?.enrollmentTab ?? enrollmentTabRef.current;
      const activePage = override?.page ?? pageRef.current;
      const activeIncludeDeleted =
        override?.includeDeleted ?? includeDeletedRef.current;
      const requestId = ++requestIdRef.current;

      try {
        setIsLoading(true);
        setError(null);

        const filters: EnrollmentFilters = {
          studentId,
          studentEnrollmentTab: activeTab,
          skip: (activePage - 1) * pageSize,
          take: pageSize,
          sortBy: "createdAt",
          sortOrder: SortOrder.DESC,
          includeDeleted: activeIncludeDeleted,
        };

        const response = await enrollmentService.getEnrollments(filters);
        const parsed = parseEnrollmentListResponse(response);

        if (requestId !== requestIdRef.current) {
          return;
        }

        setEnrollments(parsed.items);
        setTotal(parsed.total);

        if (override) {
          skipNextEffectRef.current = true;

          if (override.enrollmentTab !== undefined) {
            enrollmentTabRef.current = override.enrollmentTab;
          }

          if (override.page !== undefined) {
            pageRef.current = override.page;
            setPage(override.page);
          }

          if (override.includeDeleted !== undefined) {
            includeDeletedRef.current = override.includeDeleted;
            setIncludeDeleted(override.includeDeleted);
          }
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setError(getErrorMessage(err));
        setEnrollments([]);
        setTotal(0);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [pageSize, studentId],
  );

  useEffect(() => {
    setPage(1);
  }, [studentId, includeDeleted]);

  useEffect(() => {
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false;
      return;
    }

    void fetchEnrollments();
  }, [fetchEnrollments, enrollmentTab, page, includeDeleted]);

  useRealtimeRefetch("enrollment", fetchEnrollments);
  useRealtimeRefetch("student", fetchEnrollments);

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
