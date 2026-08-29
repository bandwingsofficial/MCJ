import { apiClient } from "@/src/core/api/axios";
import type { ApiSuccess } from "@/src/features/branch-ops/types";

interface UnenrollEnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: string;
  };
}

export const branchEnrollmentApi = {
  unenroll: (enrollmentId: string, reason?: string) =>
    apiClient
      .post<ApiSuccess<UnenrollEnrollmentResponse["data"]>>(
        `/admin/enrollments/${enrollmentId}/unenroll`,
        reason ? { reason } : {},
      )
      .then((response) => response.data),
};
