"use client";

import { useEffect, useState } from "react";

import { branchService } from "@/src/features/branches/services/branch.service";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";

export function useBranches() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch branches",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBranches();
  }, []);

  return {
    branches,
    isLoading,
    error,
    refetch: fetchBranches,
  };
}
