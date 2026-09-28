"use client";

import { useQuery } from "@tanstack/react-query";

import { referralRewardsQueryKeys } from "@/src/features/referral-rewards/constants/query-keys";
import { referralRewardsService } from "@/src/features/referral-rewards/services/referral-rewards.service";

export function usePublicReferralSettings() {
  return useQuery({
    queryKey: referralRewardsQueryKeys.publicSettings,
    queryFn: () => referralRewardsService.getPublicSettings(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
