"use client";

import {
  useEffect,
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

export function useBatches() {
  const [
    batches,
    setBatches,
  ] = useState<Batch[]>([]);

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

  const fetchBatches =
    async () => {
      try {
        setIsLoading(true);

        const data =
          await batchService.getBatches();

        setBatches(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch batches",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchBatches();
  }, []);

  return {
    batches,
    isLoading,
    error,
    refetch:
      fetchBatches,
  };
}