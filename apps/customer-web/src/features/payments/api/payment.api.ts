import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  PaymentsList,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from "@/src/features/payments/types/payment.types";

export const paymentApi = {
  createOrder(
    payload: CreatePaymentOrderRequest,
  ) {
    return apiClient.post<
      ApiResponse<CreatePaymentOrderResponse>
    >(
      "/public/payments/create-order",
      payload,
    );
  },

  verifyPayment(
    payload: VerifyPaymentRequest,
  ) {
    return apiClient.post<
      ApiResponse<VerifyPaymentResponse>
    >(
      "/public/payments/verify",
      payload,
    );
  },

  getPayments() {
    return apiClient.get<
      ApiResponse<PaymentsList>
    >("/public/payments");
  },
};