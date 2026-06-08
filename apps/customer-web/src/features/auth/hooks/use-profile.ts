// src/features/auth/hooks/use-profile.ts

"use client";

import { useQuery } from "@tanstack/react-query";

import { authService } from "@/src/features/auth/services/auth.service";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],

    queryFn: () =>
      authService.getProfile(),

    staleTime:
      1000 * 60 * 5,
  });
}