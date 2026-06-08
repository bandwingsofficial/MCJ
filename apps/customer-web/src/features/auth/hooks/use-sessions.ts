// src/features/auth/hooks/use-sessions.ts

"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "@/src/features/auth/services/auth.service";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],

    queryFn: () =>
      authService.getSessions(),
  });
}

export function useRevokeSession() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      sessionId: string
    ) =>
      authService.revokeSession(
        sessionId
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "sessions",
        ],
      });
    },
  });
}