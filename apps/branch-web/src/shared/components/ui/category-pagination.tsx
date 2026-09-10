"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface CategoryPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CategoryPagination({
  page,
  totalPages,
  onPageChange,
}: CategoryPaginationProps) {
  const prevDisabled = page === 1;
  const nextDisabled = page === totalPages;

  const buttonClass = (disabled: boolean) =>
    cn(
      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-white p-0 transition-colors",
      disabled
        ? "cursor-not-allowed border-slate-300 text-slate-500"
        : "border-[#102A56]/30 text-[#102A56] hover:bg-[#F8FBFF]",
    );

  const iconClass = "h-4 w-4 shrink-0 stroke-[2.5] text-current";

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        disabled={prevDisabled}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className={buttonClass(prevDisabled)}
      >
        <ChevronLeft className={iconClass} aria-hidden="true" />
      </button>

      <span className="min-w-[6rem] text-center text-xs leading-none text-[#102A56]">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={nextDisabled}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className={buttonClass(nextDisabled)}
      >
        <ChevronRight className={iconClass} aria-hidden="true" />
      </button>
    </div>
  );
}
