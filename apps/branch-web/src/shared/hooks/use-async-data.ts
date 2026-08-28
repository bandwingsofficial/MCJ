"use client";

import { useCallback, useEffect, useState } from "react";

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setData(await loader());
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message
          : null;
      setError(message ?? "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload, setData };
}
