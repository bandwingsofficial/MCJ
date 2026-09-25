"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { referralRewardsQueryKeys } from "@/src/features/referral-rewards/constants/query-keys";
import {
  referralRewardsService,
  type ReferralRewardsSummary,
} from "@/src/features/referral-rewards/services/referral-rewards.service";

export function useReferralRewardsSummary(options?: { enabled?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const enabled = options?.enabled ?? Boolean(user);

  return useQuery({
    queryKey: referralRewardsQueryKeys.me,
    queryFn: (): Promise<ReferralRewardsSummary> =>
      referralRewardsService.getMe(),
    enabled,
    staleTime: 30_000,
  });
}
