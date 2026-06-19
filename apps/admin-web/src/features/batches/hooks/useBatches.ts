"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

export interface BatchFilters {
  search: string;
  includeDeleted: boolean;
}

interface UseBatchesReturn {
  batches: Batch[];

  isLoading: boolean;

  error: string | null;

  filters: BatchFilters;

  setFilters: (
    filters: BatchFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const useBatches =
  (): UseBatchesReturn => {
    const [batches, setBatches] =
      useState<Batch[]>([]);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<BatchFilters>({
        search: "",
        includeDeleted: false,
      });

    const fetchBatches =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await batchService.getBatches();

          setBatches(response.data);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch batches";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchBatches();
    }, [fetchBatches]);

    return {
      batches,
      isLoading,
      error,
      filters,
      setFilters,
      refetch: fetchBatches,
    };
  };