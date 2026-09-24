"use client";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import type { CurrentBranchProfile } from "@/src/features/auth/types/profile.types";

export function useCurrentBranchId(): string | null {
  return useAuthStore((state) => state.user?.branchId ?? null);
}

export function useCurrentBranch(): CurrentBranchProfile | null {
  return useAuthStore((state) => state.user?.branch ?? null);
}
