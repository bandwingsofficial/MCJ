"use client";

import { useEffect } from "react";

import {
  subscribeRealtimeTopic,
  type RealtimeBusTopic,
} from "@/src/core/realtime/realtime-bus";

export function useRealtimeRefetch(
  topic: RealtimeBusTopic,
  refetch: () => void | Promise<void>,
): void {
  useEffect(() => {
    return subscribeRealtimeTopic(topic, () => {
      void refetch();
    });
  }, [topic, refetch]);
}
