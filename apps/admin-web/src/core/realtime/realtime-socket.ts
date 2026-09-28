"use client";

import {
  REALTIME_EVENT,
  REALTIME_SOCKET_NAMESPACE,
  type RealtimeDomainMutationPayload,
} from "@mcj/shared-constants";
import { io, type Socket } from "socket.io-client";

import { env } from "@/src/core/config/env";
import { TokenStorage } from "@/src/core/storage/token-storage";

let socket: Socket | null = null;
let socketToken: string | null = null;

function resolveRealtimeOrigin(): string {
  const base = env.apiBaseUrl?.replace(/\/$/, "") ?? "";
  if (!base) {
    return "";
  }

  try {
    const url = new URL(base);
    return url.origin;
  } catch {
    return base;
  }
}

export function disconnectRealtimeSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}

export function getRealtimeSocket(): Socket | null {
  const token = TokenStorage.getAccessToken();
  if (!token) {
    disconnectRealtimeSocket();
    return null;
  }

  const origin = resolveRealtimeOrigin();
  if (!origin) {
    return null;
  }

  if (socket && socketToken === token && socket.connected) {
    return socket;
  }

  if (socket) {
    disconnectRealtimeSocket();
  }

  socketToken = token;
  socket = io(`${origin}${REALTIME_SOCKET_NAMESPACE}`, {
    transports: ["websocket", "polling"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function onDomainMutation(
  handler: (payload: RealtimeDomainMutationPayload) => void,
): () => void {
  const client = getRealtimeSocket();
  if (!client) {
    return () => undefined;
  }

  client.on(REALTIME_EVENT.DOMAIN_MUTATION, handler);

  return () => {
    client.off(REALTIME_EVENT.DOMAIN_MUTATION, handler);
  };
}
