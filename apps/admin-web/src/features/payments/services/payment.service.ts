import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { paymentApi } from "@/src/features/payments/api/payment.api";
import type {
  CreateManualPaymentRequest,
  PaymentFilters,
} from "@/src/features/payments/types/payment.types";

function wrapError(error: unknown): Error {
  return new Error(getErrorMessage(error));
}

export const paymentService = {
  async getPayments(filters?: PaymentFilters) {
    try {
      const response = await paymentApi.getPayments(filters);
      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },

  async createPayment(payload: CreateManualPaymentRequest) {
    try {
      const response = await paymentApi.createPayment(payload);
      return response.data;
    } catch (error) {
      throw wrapError(error);
    }
  },
};
