"use client";

import { useEffect } from "react";

import { BATCH_LIFECYCLE_CHANGED_EVENT } from "@/src/features/batches/utils/batch-lifecycle-sync";

/** Refetch batch data when lifecycle changes (edit batch, assign, etc.). */
export function useBatchLifecycleRefetch(
  refetch: () => void | Promise<void>,
): void {
  useEffect(() => {
    const handleLifecycleChanged = () => {
      void refetch();
    };

    window.addEventListener(
      BATCH_LIFECYCLE_CHANGED_EVENT,
      handleLifecycleChanged,
    );

    return () => {
      window.removeEventListener(
        BATCH_LIFECYCLE_CHANGED_EVENT,
        handleLifecycleChanged,
      );
    };
  }, [refetch]);
}
