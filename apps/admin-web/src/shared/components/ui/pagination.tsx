"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { cn } from "@/src/shared/lib/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="h-9 w-9 rounded-lg p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-[8rem] text-center text-[15px] leading-9 text-slate-600">
        Page {page} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="h-9 w-9 rounded-lg p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
