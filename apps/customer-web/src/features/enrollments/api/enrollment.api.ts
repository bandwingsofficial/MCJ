import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  CreateEnrollmentRequest,
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

export const enrollmentApi = {
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
};