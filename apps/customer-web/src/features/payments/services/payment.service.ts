import { paymentApi } from "@/src/features/payments/api/payment.api";

import type {
  CreatePaymentOrderRequest,
  VerifyPaymentRequest,
} from "@/src/features/payments/types/payment.types";

class PaymentService {
  async createOrder(
    payload: CreatePaymentOrderRequest,
  ) {
    const response =
      await paymentApi.createOrder(
        payload,
      );

    return response.data.data;
  }

  async verifyPayment(
    payload: VerifyPaymentRequest,
  ) {
    const response =
      await paymentApi.verifyPayment(
        payload,
      );

    return response.data.data;
  }

  async getPayments() {
    const response =
      await paymentApi.getPayments();

    return response.data.data;
  }
}

export const paymentService =
  new PaymentService();