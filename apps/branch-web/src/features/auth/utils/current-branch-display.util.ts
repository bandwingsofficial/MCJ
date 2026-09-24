import type { CurrentBranchProfile } from "@/src/features/auth/types/profile.types";

type BranchNameLike = { branchName?: string | null } | null | undefined;

/** Prefer authenticated portal branch; optional API fallback for read-only legacy rows. */
export function resolvePortalBranchName(
  current: CurrentBranchProfile | null,
  fallback?: BranchNameLike,
): string {
  const name = current?.branchName?.trim() || fallback?.branchName?.trim();
  return name || "—";
}
