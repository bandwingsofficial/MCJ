import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";



function unwrap<T>(response: { data: ApiResponse<T> }): T {

  return response.data.data;

}



export interface ReferralRewardsSummary {

  referralCode: string | null;

  referredBy: unknown;

  wallet: {

    availableCoins: number;

    lockedCoins: number;

    totalEarned: number;

    totalRedeemed: number;

  } | null;

  stats: {

    totalReferrals: number;

    successfulReferrals: number;

    pendingReferrals: number;

    coinsEarnedFromReferrals: number;

  };

  referrals: Array<{

    id: string;

    publicId: string;

    status: string;

    rewardCoins: number;

    rewardedAt: string | null;

    createdAt: string;

    referred: { id: string; name: string; email: string };

  }>;

}



export interface PublicReferralSettings {

  referralEnabled: boolean;

  redemptionEnabled: boolean;

  coinsPerRupee: number;

  minRedemptionCoins: number;

  maxRedemptionCoins: number | null;

  rewardCoinsPerReferral: number;

}



export type CoinTransactionItem = {

  id: string;

  publicId: string;

  type: string;

  direction: "CREDIT" | "DEBIT";

  amount: number;

  description: string | null;

  availableAfter: number;

  createdAt: string;

  referral?: {

    referred: { name: string; email: string };

  } | null;

  redemption?: { publicId: string } | null;

};



export type RedemptionHistoryItem = {

  id: string;

  publicId: string;

  coins: number;

  moneyValuePaise: number;

  status: string;

  requestedAt: string;

  processedAt?: string | null;

  approvedAt?: string | null;

  rejectedAt?: string | null;

};



export const referralRewardsService = {

  async getMe(): Promise<ReferralRewardsSummary> {
    return apiClient
      .get<ApiResponse<ReferralRewardsSummary>>("/referral-rewards/me")
      .then(unwrap);
  },



  async getPublicSettings(): Promise<PublicReferralSettings> {
    return apiClient
      .get<ApiResponse<PublicReferralSettings>>(
        "/referral-rewards/settings/public",
      )
      .then(unwrap);
  },



  async listTransactions(params?: {
    direction?: "CREDIT" | "DEBIT";
    take?: number;
    skip?: number;
  }): Promise<{ items: CoinTransactionItem[]; total: number }> {
    return apiClient
      .get<
        ApiResponse<{
          items: CoinTransactionItem[];
          total: number;
        }>
      >("/referral-rewards/wallet/transactions", { params })
      .then(unwrap);
  },



  async listRedemptions(): Promise<RedemptionHistoryItem[]> {
    return apiClient
      .get<ApiResponse<RedemptionHistoryItem[]>>(
        "/referral-rewards/wallet/redemptions",
      )
      .then(unwrap);
  },



  async createRedemption(coins: number) {

    return apiClient

      .post<ApiResponse<unknown>>("/referral-rewards/redemptions", {

        coins,

      })

      .then(unwrap);

  },

};

