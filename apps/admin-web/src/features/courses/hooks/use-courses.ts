"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  courseService,
  resolveCourseListTotal,
} from "@/src/features/courses/services/course.service";

import {
  DEFAULT_COURSE_PAGE_SIZE,
} from "@/src/features/courses/constants/course.constants";

import type {
  CourseFilters,
  CourseListItem,
} from "@/src/features/courses/types/course.types";

const SEARCH_DEBOUNCE_MS = 400;

function hasActiveCourseFilters(filters: CourseFilters): boolean {
  return Boolean(
    (filters.search ?? "").trim() ||
      filters.categoryId ||
      filters.status,
  );
}

interface UseCoursesReturn {
  courses: CourseListItem[];

  total: number;

  /** Total courses in the catalog (unfiltered). */
  catalogTotal: number;

  /** Alias of total for legacy callers. */
  count: number;

  isInitialLoading: boolean;

  isFetching: boolean;

  /** Alias of isInitialLoading for legacy callers. */
  isLoading: boolean;

  error: string | null;

  filters: CourseFilters;

  setFilters: (filters: CourseFilters) => void;

  refetch: () => Promise<void>;
}

export const useCourses = (options?: {
  pageSize?: number;
}): UseCoursesReturn => {
  const defaultPageSize =
    options?.pageSize ?? DEFAULT_COURSE_PAGE_SIZE;

  const [courses, setCourses] = useState<
    CourseListItem[]
  >([]);

  const [total, setTotal] = useState(0);

  const [catalogTotal, setCatalogTotal] = useState(0);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [filters, setFiltersState] =
    useState<CourseFilters>({
      search: "",
      categoryId: undefined,
      status: undefined,
      page: 1,
      pageSize: defaultPageSize,
    });

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const setFilters = useCallback(
    (next: CourseFilters) => {
      setFiltersState((prev) => {
        const statusChanged =
          next.status !== prev.status;
        const categoryChanged =
          next.categoryId !== prev.categoryId;
        const pageSizeChanged =
          next.pageSize !== prev.pageSize;

        const shouldResetPage =
          statusChanged ||
          categoryChanged ||
          pageSizeChanged;

        return {
          ...next,
          page: shouldResetPage ? 1 : next.page,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();

      setDebouncedSearch((prev) =>
        prev === nextSearch ? prev : nextSearch
      );

      setFiltersState((prev) =>
        prev.page === 1
          ? prev
          : { ...prev, page: 1 }
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const fetchCourses = useCallback(
    async (options?: { silent?: boolean }) => {
      const requestId = ++requestIdRef.current;
      const silent = options?.silent === true;
      const isFirstLoad = !hasLoadedRef.current;

      try {
        if (isFirstLoad) {
          setIsInitialLoading(true);
        } else if (!silent) {
          setIsFetching(true);
        }

        const response = await courseService.getCourses({
          search: debouncedSearch,
          categoryId: filters.categoryId,
          status: filters.status,
          page: filters.page ?? 1,
          pageSize:
            filters.pageSize ?? DEFAULT_COURSE_PAGE_SIZE,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        const listTotal = resolveCourseListTotal(response.data);

        setCourses(response.data.items);
        setTotal(listTotal);

        if (!hasActiveCourseFilters(filters)) {
          setCatalogTotal(listTotal);
        }

        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch courses";

        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setIsFetching(false);
        }
      }
    },
    [
      debouncedSearch,
      filters.categoryId,
      filters.status,
      filters.page,
      filters.pageSize,
      filters.search,
    ]
  );

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    total,
    catalogTotal,
    count: total,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: () => fetchCourses({ silent: false }),
  };
};
