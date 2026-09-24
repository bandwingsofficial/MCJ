"use client";

import { useEffect, useState } from "react";

const DEFAULT_TICK_MS = 30_000;

export function useLifecycleNow(tickMs = DEFAULT_TICK_MS): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, tickMs);
    return () => window.clearInterval(timer);
  }, [tickMs]);

  return nowMs;
}
