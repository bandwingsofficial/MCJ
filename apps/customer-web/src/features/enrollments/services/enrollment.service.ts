import { enrollmentApi } from "@/src/features/enrollments/api/enrollment.api";
import {
  syncEnrollmentImageFields,
  syncEnrollmentImageList,
} from "@/src/shared/utils/entity-image-sync.util";

import type {
  CreateEnrollmentRequest,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

class EnrollmentService {
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
}

export const enrollmentService =
  new EnrollmentService();
