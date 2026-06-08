// src/features/categories/components/category-search.tsx

"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

interface CategorySearchProps {
  value: string;
  onChange: (
    value: string
  ) => void;
}

export function CategorySearch({
  value,
  onChange,
}: CategorySearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
    />
  );
}