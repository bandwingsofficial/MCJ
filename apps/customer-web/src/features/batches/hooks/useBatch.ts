"use client";

import {
  useEffect,
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

export function useBatch(
  id: string,
) {
  const [
    batch,
    setBatch,
  ] = useState<
    Batch | null
  >(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchBatch =
      async () => {
        try {
          setIsLoading(true);

          const data =
            await batchService.getBatch(
              id,
            );

          setBatch(data);

          setError(null);
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to fetch batch",
          );
        } finally {
          setIsLoading(false);
        }
      };

    void fetchBatch();
  }, [id]);

  return {
    batch,
    isLoading,
    error,
  };
}