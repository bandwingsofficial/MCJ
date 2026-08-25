import type { BranchFilters } from "@/src/features/branches/types/branch.types";

export function getBranchEmptyMessage(filters: BranchFilters): string {
  if (filters.status === "ARCHIVED") {
    return "No archived branches found.";
  }

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() || filters.status,
  );

  if (hasActiveFilters) {
    return "No branches match your filters.";
  }

  return "No branches found.";
}
