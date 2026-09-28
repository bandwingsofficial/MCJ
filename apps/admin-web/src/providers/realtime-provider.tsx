"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { handleDomainMutation } from "@/src/core/realtime/handle-domain-mutation";
import {
  disconnectRealtimeSocket,
  getRealtimeSocket,
  onDomainMutation,
} from "@/src/core/realtime/realtime-socket";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export function RealtimeProvider() {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    if (authStatus !== "AUTHENTICATED") {
      disconnectRealtimeSocket();
      return;
    }

    const socket = getRealtimeSocket();
    if (!socket) {
      return;
    }

    const unsubscribeMutation = onDomainMutation((payload) => {
      handleDomainMutation(queryClient, payload);
    });

    const onReconnect = () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    };

    socket.on("connect", onReconnect);

    return () => {
      unsubscribeMutation();
      socket.off("connect", onReconnect);
      disconnectRealtimeSocket();
    };
  }, [authStatus, queryClient]);

  return null;
}
