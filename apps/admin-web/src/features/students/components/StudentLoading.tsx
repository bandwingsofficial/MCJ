"use client";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

export function StudentLoading() {
  return <SkeletonTable rows={10} />;
}