"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

interface CourseSearchProps {
  value: string;
  onChange: (
    value: string
  ) => void;
}

export function CourseSearch({
  value,
  onChange,
}: CourseSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
    />
  );
}