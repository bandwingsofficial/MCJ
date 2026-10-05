"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import {
  bootstrapEnrollmentNotificationWatermark,
  readEnrollmentNotificationWatermark,
  writeEnrollmentNotificationWatermark,
} from "@/src/features/enrollments/utils/enrollment-notification-storage";

export interface OnlineEnrollmentNotificationState {
  count: number;
  isLoading: boolean;
  acknowledge: (latestCreatedAt?: string | null) => void;
  refresh: () => Promise<void>;
}

export function useOnlineEnrollmentNotifications(): OnlineEnrollmentNotificationState {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const latestCreatedAtRef = useRef<string | null>(null);
  const watermarkRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    if (!watermarkRef.current) {
      watermarkRef.current = bootstrapEnrollmentNotificationWatermark(userId);
    }

    setIsLoading(true);
    try {
      const data = await enrollmentService.getOnlineEnrollmentNotifications(
        watermarkRef.current,
      );
      latestCreatedAtRef.current = data.latestCreatedAt;
      setCount(data.count);
    } catch {
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    watermarkRef.current =
      readEnrollmentNotificationWatermark(userId) ??
      bootstrapEnrollmentNotificationWatermark(userId);
    void refresh();
  }, [userId, refresh]);

  useRealtimeRefetch("enrollment", refresh);

  const acknowledge = useCallback(
    (latestCreatedAt?: string | null) => {
      if (!userId) return;

      const nextWatermark =
        latestCreatedAt ??
        latestCreatedAtRef.current ??
        new Date().toISOString();

      writeEnrollmentNotificationWatermark(userId, nextWatermark);
      watermarkRef.current = nextWatermark;
      latestCreatedAtRef.current = null;
      setCount(0);
    },
    [userId],
  );

  return {
    count,
    isLoading,
    acknowledge,
    refresh,
  };
}
