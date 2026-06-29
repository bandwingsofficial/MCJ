"use client";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

export function CommunitySkeleton() {
  return <SkeletonTable rows={8} />;
}