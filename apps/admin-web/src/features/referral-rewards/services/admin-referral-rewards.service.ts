import { apiClient } from "@/src/core/api/axios";
import type { ApiSuccessResponse } from "@/src/core/types/api-response.types";

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data;
}

function unwrapArray<T>(response: { data: ApiSuccessResponse<T[]> | ApiSuccessResponse<T> }) {
  const payload = unwrap<T[] | T>(response as { data: ApiSuccessResponse<T[] | T> });
  if (Array.isArray(payload)) {
    return payload;
  }
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }
  return [] as T[];
}

export type ReferralUserUsageRow = {
  owner: {
    id: string;
    name: string;
    email: string;
    referralCode: string | null;
  };
  totalUses: number;
  successfulUses: number;
  pendingUses: number;
  rejectedUses: number;
  coinsEarned: number;
};

export interface AdminReferralDashboardMetrics {
  users: { totalUsers: number; totalReferralCodes: number };
  referrals: {
    total: number;
    successful: number;
    pending: number;
    rejectedOrExpired: number;
    byStatus: Record<string, number>;
  };
  coins: {
    totalIssued: number;
    totalRedeemed: number;
    outstandingAvailable: number;
    outstandingLocked: number;
  };
  redemptions: {
    pending: number;
    byStatus: Record<string, number>;
  };
}

export const adminReferralRewardsService = {
  getDashboard() {
    return apiClient
      .get<ApiSuccessResponse<AdminReferralDashboardMetrics>>(
        "/admin/referral-rewards/dashboard",
      )
      .then(unwrap);
  },
  listSettings() {
    return apiClient
      .get<ApiSuccessResponse<Array<Record<string, unknown>>>>(
        "/admin/referral-rewards/settings",
      )
      .then(unwrap);
  },
  getActiveSettings() {
    return apiClient
      .get<ApiSuccessResponse<Record<string, unknown>>>(
        "/admin/referral-rewards/settings/active",
      )
      .then(unwrap);
  },
  createSettings(payload: Record<string, unknown>) {
    return apiClient
      .post<ApiSuccessResponse<Record<string, unknown>>>(
        "/admin/referral-rewards/settings",
        payload,
      )
      .then(unwrap);
  },
  updateSettings(id: string, payload: Record<string, unknown>) {
    return apiClient
      .put<ApiSuccessResponse<Record<string, unknown>>>(
        `/admin/referral-rewards/settings/${id}`,
        payload,
      )
      .then(unwrap);
  },
  activateSettings(id: string) {
    return apiClient
      .post<ApiSuccessResponse<Record<string, unknown>>>(
        `/admin/referral-rewards/settings/${id}/activate`,
      )
      .then(unwrap);
  },
  listReferrals(params?: Record<string, string | number | undefined>) {
    return apiClient
      .get<ApiSuccessResponse<{ items: unknown[]; total: number }>>(
        "/admin/referral-rewards/referrals",
        { params },
      )
      .then(unwrap);
  },
  getReferral(id: string) {
    return apiClient
      .get<ApiSuccessResponse<Record<string, unknown>>>(
        `/admin/referral-rewards/referrals/${id}`,
      )
      .then(unwrap);
  },
  listReferralUsers(params?: Record<string, string | number | undefined>) {
    return apiClient
      .get<ApiSuccessResponse<ReferralUserUsageRow[]>>(
        "/admin/referral-rewards/referral-users",
        { params },
      )
      .then(unwrapArray);
  },
  listCoinTransactions(params?: Record<string, string | number | undefined>) {
    return apiClient
      .get<ApiSuccessResponse<{ items: unknown[]; total: number }>>(
        "/admin/referral-rewards/coin-transactions",
        { params },
      )
      .then(unwrap);
  },
  listRedemptions(params?: Record<string, string | number | undefined>) {
    return apiClient
      .get<ApiSuccessResponse<{ items: unknown[]; total: number }>>(
        "/admin/referral-rewards/redemptions",
        { params },
      )
      .then(unwrap);
  },
  getRedemption(id: string) {
    return apiClient
      .get<ApiSuccessResponse<Record<string, unknown>>>(
        `/admin/referral-rewards/redemptions/${id}`,
      )
      .then(unwrap);
  },
  approveRedemption(id: string) {
    return apiClient
      .post<ApiSuccessResponse<unknown>>(
        `/admin/referral-rewards/redemptions/${id}/approve`,
      )
      .then(unwrap);
  },
  rejectRedemption(id: string, reason?: string) {
    return apiClient
      .post<ApiSuccessResponse<unknown>>(
        `/admin/referral-rewards/redemptions/${id}/reject`,
        { reason },
      )
      .then(unwrap);
  },
  processRedemption(id: string) {
    return apiClient
      .post<ApiSuccessResponse<unknown>>(
        `/admin/referral-rewards/redemptions/${id}/process`,
      )
      .then(unwrap);
  },
  creditWallet(userId: string, amount: number, reason: string) {
    return apiClient
      .post<ApiSuccessResponse<unknown>>(
        `/admin/referral-rewards/wallets/${userId}/credit`,
        { amount, reason },
      )
      .then(unwrap);
  },
  debitWallet(userId: string, amount: number, reason: string) {
    return apiClient
      .post<ApiSuccessResponse<unknown>>(
        `/admin/referral-rewards/wallets/${userId}/debit`,
        { amount, reason },
      )
      .then(unwrap);
  },
  getUserSummary(userId: string) {
    return apiClient
      .get<ApiSuccessResponse<Record<string, unknown>>>(
        `/admin/referral-rewards/users/${userId}/summary`,
      )
      .then(unwrap);
  },
};
