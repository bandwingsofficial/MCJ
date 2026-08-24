import { enrollmentApi } from "@/src/features/enrollments/api/enrollment.api";

import type {
  CreateEnrollmentRequest,
} from "@/src/features/enrollments/types/enrollment.types";

class EnrollmentService {
  async createEnrollment(
    payload: CreateEnrollmentRequest,
  ) {
    const response =
      await enrollmentApi.createEnrollment(
        payload,
      );

    return response.data.data;
  }

  async getMyEnrollments() {
    const response =
      await enrollmentApi.getMyEnrollments();

    return response.data.data;
  }

  async getEnrollment(id: string) {
    const response = await enrollmentApi.getEnrollment(id);

    return response.data.data;
  }
}

export const enrollmentService =
  new EnrollmentService();