import { apiClient } from "@/src/core/api/axios";
import type { ApiResponse } from "@/src/core/types/api-response.types";

class AccountService {
  async deletePermanently(confirmation: string, reason?: string) {
    const response = await apiClient.post<
      ApiResponse<{ id: string; deletedAt: string }>
    >("/account/delete-permanently", {
      confirmation,
      reason,
    });
    return response.data.data;
  }
}

export const accountService = new AccountService();
