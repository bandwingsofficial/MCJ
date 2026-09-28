"use client";

import { useQuery } from "@tanstack/react-query";

import { referralRewardsService } from "@/src/features/referral-rewards/services/referral-rewards.service";

export function useReferralCodePreview(
  code: string,
  email: string,
  enabled: boolean,
  referralProgramEnabled = true,
) {
  const normalizedCode = code.trim().toUpperCase();

  return useQuery({
    queryKey: [
      "auth",
      "referral-preview",
      normalizedCode,
      email.trim().toLowerCase(),
    ],
    queryFn: () =>
      referralRewardsService.validateRegistrationCode(
        normalizedCode,
        email.trim() || undefined,
      ),
    enabled:
      referralProgramEnabled &&
      enabled &&
      /^[A-Za-z0-9]{6,12}$/.test(normalizedCode),
    staleTime: 30_000,
    retry: false,
  });
}
