"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

interface JobSearchProps {
  value: string;

  onChange: (
    value: string,
  ) => void;
}

export function JobSearch({
  value,
  onChange,
}: JobSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
    />
  );
}