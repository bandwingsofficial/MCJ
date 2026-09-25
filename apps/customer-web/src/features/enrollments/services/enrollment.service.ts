import { enrollmentApi } from "@/src/features/enrollments/api/enrollment.api";
import {
  syncEnrollmentImageFields,
  syncEnrollmentImageList,
} from "@/src/shared/utils/entity-image-sync.util";

import type {
  CreateEnrollmentCheckoutOrderRequest,
} from "@/src/features/enrollments/api/enrollment.api";
import type {
  CreateEnrollmentRequest,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";
import type { CreatePaymentOrderResponse } from "@/src/features/payments/types/payment.types";

class EnrollmentService {
  async createCheckoutOrder(
    payload: CreateEnrollmentCheckoutOrderRequest,
  ): Promise<CreatePaymentOrderResponse> {
    const response = await enrollmentApi.createCheckoutOrder(payload);

    return response.data.data;
  }

  async createEnrollment(
    payload: CreateEnrollmentRequest,
  ): Promise<Enrollment> {
    const response =
      await enrollmentApi.createEnrollment(
        payload,
      );

    return syncEnrollmentImageFields(response.data.data);
  }

  async getMyEnrollments(): Promise<Enrollment[]> {
    const response =
      await enrollmentApi.getMyEnrollments();

    return syncEnrollmentImageList(response.data.data ?? []);
  }

  async getEnrollment(id: string): Promise<Enrollment> {
    const response = await enrollmentApi.getEnrollment(id);

    return syncEnrollmentImageFields(response.data.data);
  }

  async applyCoins(enrollmentId: string, coins: number): Promise<Enrollment> {
    const response = await enrollmentApi.applyCoins(enrollmentId, coins);

    return syncEnrollmentImageFields(response.data.data);
  }

  async removeAppliedCoins(enrollmentId: string): Promise<Enrollment> {
    const response = await enrollmentApi.removeAppliedCoins(enrollmentId);

    return syncEnrollmentImageFields(response.data.data);
  }
}

export const enrollmentService =
  new EnrollmentService();
