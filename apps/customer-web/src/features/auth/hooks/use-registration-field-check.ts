"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "@/src/features/auth/api/auth.api";

const AVAILABILITY_DEBOUNCE_MS = 400;

export function useRegistrationEmailCheck(
  email: string,
  enabled: boolean,
) {
  const normalized = email.trim().toLowerCase();

  return useQuery({
    queryKey: ["auth", "register-check-email", normalized],
    queryFn: async () => {
      const response = await authApi.checkRegistrationEmail(normalized);
      return response.data.data;
    },
    enabled: enabled && normalized.length > 0,
    staleTime: 30_000,
    retry: false,
  });
}

export function useRegistrationPhoneCheck(
  phone: string,
  enabled: boolean,
) {
  const normalized = phone.trim();

  return useQuery({
    queryKey: ["auth", "register-check-phone", normalized],
    queryFn: async () => {
      const response = await authApi.checkRegistrationPhone(normalized);
      return response.data.data;
    },
    enabled: enabled && /^[0-9]{10}$/.test(normalized),
    staleTime: 30_000,
    retry: false,
  });
}

export { AVAILABILITY_DEBOUNCE_MS };
