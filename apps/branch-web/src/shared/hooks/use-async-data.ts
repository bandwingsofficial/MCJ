"use client";

import { useCallback, useEffect, useState } from "react";

import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      setData(await loader());
    } catch (err) {
      setError(
        userFacingApiMessage(
          parseBranchOpsError(err),
          "Unable to load data. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}
