"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
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
  emptyIcon: EmptyIcon,
  children,
  className,
  skeletonCount = 3,
  columnsClassName = "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3",
}: Props) {
  if (isLoading) {
    return (
      <div className={cn(columnsClassName, className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#E1EBF5] bg-white p-3 shadow-sm"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-3 h-14 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        className={cn(
          "flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center",
          className,
        )}
      >
        {EmptyIcon ? (
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFF] text-[#647A9B] ring-1 ring-[#DCE8F5]">
            <EmptyIcon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
        <h3 className="text-base font-semibold text-[#102A56]">{emptyMessage}</h3>
        {emptyDescription ? (
          <p className="mt-1 max-w-md text-sm text-[#647A9B]">{emptyDescription}</p>
        ) : null}
      </div>
    );
  }

  return <div className={cn(columnsClassName, className)}>{children}</div>;
}
