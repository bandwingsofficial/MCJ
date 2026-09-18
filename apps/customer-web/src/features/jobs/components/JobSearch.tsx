"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { cn } from "@/src/shared/lib/cn";

interface JobSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function JobSearch({
  value,
  onChange,
  className,
  placeholder = "Search jobs by title or company...",
}: JobSearchProps) {
  return (
    <SearchInput
      value={value}
      placeholder={placeholder}
      className={cn(
        "h-11 rounded-xl border-slate-200 bg-[#F8FBFF] pl-10 shadow-none focus-visible:ring-[#2563EB]/30",
        className,
      )}
      onChange={onChange}
    />
  );
}
