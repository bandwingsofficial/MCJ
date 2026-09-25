import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  CreateEnrollmentRequest,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

export interface CreateEnrollmentCheckoutOrderRequest {
  batchId: string;
  batchTimingId: string;
  branchId: string;
  courseId: string;
  coinsToRedeem?: number;
}

export const enrollmentApi = {
  createCheckoutOrder(payload: CreateEnrollmentCheckoutOrderRequest) {
    return apiClient.post<
      ApiResponse<import("@/src/features/payments/types/payment.types").CreatePaymentOrderResponse>
    >("/enrollments/checkout-order", payload);
  },

  createEnrollment(
    payload: CreateEnrollmentRequest,
  ) {
    return apiClient.post<
      ApiResponse<Enrollment>
    >(
      "/enrollments",
      payload,
    );
  },

  getMyEnrollments() {
    return apiClient.get<
      ApiResponse<Enrollment[]>
    >("/enrollments/me");
  },

  getEnrollment(id: string) {
    return apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
  },

  applyCoins(enrollmentId: string, coins: number) {
    return apiClient.post<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}/apply-coins`,
      { coins },
    );
  },

  removeAppliedCoins(enrollmentId: string) {
    return apiClient.post<ApiResponse<Enrollment>>(
      `/enrollments/${enrollmentId}/remove-coins`,
    );
  },
};