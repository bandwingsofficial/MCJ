// src/features/courses/hooks/use-course-search.ts

import { useState } from "react";

import {
  useDebounce,
} from "@/src/shared/hooks/use-debounce";

export function useCourseSearch() {
  const [
    search,
    setSearch,
  ] = useState("");

  const debouncedSearch =
    useDebounce(
      search,
      500
    );

  return {
    search,
    setSearch,
    debouncedSearch,
  };
}