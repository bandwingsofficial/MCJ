import { apiClient } from "@/src/core/api/axios";

import type {
  CreateManualPaymentRequest,
  PaymentFilters,
  PaymentListResponse,
  PaymentResponse,
} from "@/src/features/payments/types/payment.types";

export const paymentApi = {
  async getPayments(filters?: PaymentFilters) {
    const response = await apiClient.get<PaymentListResponse>(
      "/admin/payments",
      { params: filters },
    );

    return response.data;
  },

  async createPayment(payload: CreateManualPaymentRequest) {
    const response = await apiClient.post<PaymentResponse>(
      "/admin/payments",
      payload,
    );

    return response.data;
  },
};
