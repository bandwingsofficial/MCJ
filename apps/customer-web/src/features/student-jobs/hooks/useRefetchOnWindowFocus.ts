"use client";

import { useEffect } from "react";

export function useRefetchOnWindowFocus(
  refetch: () => Promise<void>,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleRefetch = () => {
      void refetch();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refetch();
      }
    };

    window.addEventListener("focus", handleRefetch);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleRefetch);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [enabled, refetch]);
}
