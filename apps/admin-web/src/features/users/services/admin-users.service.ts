import { apiClient } from "@/src/core/api/axios";
import type { ApiSuccessResponse } from "@/src/core/types/api-response.types";

function unwrap<T>(response: { data: ApiSuccessResponse<T> }): T {
  return response.data.data;
}

export type PortalAccountStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  referralCode: string | null;
  referredBy: { id: string; name: string } | null;
  totalReferrals: number;
  availableCoins: number;
  lockedCoins: number;
  accountStatus: PortalAccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export const adminUsersService = {
  getDashboard() {
    return apiClient
      .get<ApiSuccessResponse<Record<string, number>>>(
        "/admin/users/dashboard",
      )
      .then(unwrap);
  },
  list(params: Record<string, string | number | undefined>) {
    return apiClient
      .get<
        ApiSuccessResponse<{
          items: AdminUserListItem[];
          total: number;
          take: number;
          skip: number;
        }>
      >("/admin/users", { params })
      .then(unwrap);
  },
  getById(id: string) {
    return apiClient
      .get<ApiSuccessResponse<Record<string, unknown>>>(`/admin/users/${id}`)
      .then(unwrap);
  },
  suspend(id: string, reason?: string) {
    return apiClient
      .post<ApiSuccessResponse<{ success: boolean }>>(
        `/admin/users/${id}/suspend`,
        { reason },
      )
      .then(unwrap);
  },
  unsuspend(id: string) {
    return apiClient
      .post<ApiSuccessResponse<{ success: boolean }>>(
        `/admin/users/${id}/unsuspend`,
      )
      .then(unwrap);
  },
  deletePermanently(id: string, reason?: string) {
    return apiClient
      .post<ApiSuccessResponse<{ id: string }>>(
        `/admin/users/${id}/delete-permanently`,
        { reason },
      )
      .then(unwrap);
  },
  listCoinTransactions(userId: string, params?: { take?: number; skip?: number }) {
    return apiClient
      .get<
        ApiSuccessResponse<{
          items: Array<Record<string, unknown>>;
          total: number;
        }>
      >(`/admin/users/${userId}/coin-transactions`, { params })
      .then(unwrap);
  },
  listRedemptions(userId: string) {
    return apiClient
      .get<
        ApiSuccessResponse<{
          items: Array<Record<string, unknown>>;
          total: number;
        }>
      >(`/admin/users/${userId}/redemptions`)
      .then(unwrap);
  },
};
