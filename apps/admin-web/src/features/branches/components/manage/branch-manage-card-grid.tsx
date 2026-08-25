"use client";

import type { ReactNode } from "react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage: string;
  emptyDescription?: string;
  children?: ReactNode;
  className?: string;
  skeletonCount?: number;
  columnsClassName?: string;
}

export function BranchManageCardGrid({
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  emptyDescription,
  children,
  className,
  skeletonCount = 3,
  columnsClassName = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
}: Props) {
  if (isLoading) {
    return (
      <div className={cn(columnsClassName, className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/2" />
            <Skeleton className="mt-4 h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-slate-900">{emptyMessage}</p>
        {emptyDescription ? (
          <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }

  return <div className={cn(columnsClassName, className)}>{children}</div>;
}
