"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { studentService } from "@/src/features/students/services/student.service";
import type {
  Student,
  StudentFilters,
} from "@/src/features/students/types/student.types";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { DEFAULT_STUDENT_FILTERS } from "@/src/features/students/constants/student.constants";

const SEARCH_DEBOUNCE_MS = 400;

interface UseStudentsReturn {
  students: Student[];
  total: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: StudentFilters;
  setFilters: (filters: StudentFilters) => void;
  refetch: () => Promise<void>;
}

export const useStudents = (): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<StudentFilters>({
    ...DEFAULT_STUDENT_FILTERS,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: StudentFilters) => {
    setFiltersState((prev) => {
      const filterChanged =
        next.search !== prev.search ||
        next.branchId !== prev.branchId ||
        next.status !== prev.status ||
        next.gender !== prev.gender ||
        next.includeDeleted !== prev.includeDeleted ||
        next.includeAll !== prev.includeAll ||
        next.onlyActive !== prev.onlyActive ||
        next.pageSize !== prev.pageSize;

      return {
        ...next,
        page: filterChanged ? 1 : next.page,
      };
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();
      setDebouncedSearch((prev) => (prev === nextSearch ? prev : nextSearch));
      setFiltersState((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const fetchStudents = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      if (!hasLoadedRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      setError(null);

      const response = await studentService.getStudents({
        ...filters,
        search: debouncedSearch,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const payload = parseStudentListResponse(response.data);
      setStudents(payload.items);
      setTotal(payload.count);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
  }, [
    debouncedSearch,
    filters.branchId,
    filters.gender,
    filters.includeDeleted,
    filters.includeAll,
    filters.onlyActive,
    filters.page,
    filters.pageSize,
    filters.status,
  ]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    total,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: fetchStudents,
  };
};
