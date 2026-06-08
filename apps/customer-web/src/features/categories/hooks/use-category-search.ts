// src/features/categories/hooks/use-category-search.ts

import {
  useState,
} from "react";

import {
  useDebounce,
} from "@/src/shared/hooks/use-debounce";

export function useCategorySearch() {
  const [search, setSearch] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 500);

  return {
    search,
    setSearch,
    debouncedSearch,
  };
}