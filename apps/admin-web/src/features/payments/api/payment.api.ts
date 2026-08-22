import { apiClient } from "@/src/core/api/axios";

import type {
  PaymentFilters,
  PaymentListResponse,
} from "@/src/features/payments/types/payment.types";

export const paymentApi = {
  async getPayments(filters?: PaymentFilters) {
    const response = await apiClient.get<PaymentListResponse>(
      "/admin/payments",
      { params: filters },
    );

    return response.data;
  },
};
