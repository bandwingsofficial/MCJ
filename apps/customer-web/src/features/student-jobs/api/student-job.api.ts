import { apiClient } from "@/src/core/api/axios";

import type {
  ApiResponse,
} from "@/src/core/types/api-response.types";

import type {
  ApplyJobRequest,
  ApplyJobResponse,
  JobApplication,
} from "@/src/features/student-jobs/types";

export const studentJobApi = {
  applyJob(
    jobId: string,
    payload: ApplyJobRequest,
  ) {
    return apiClient.post<
      ApiResponse<ApplyJobResponse>
    >(
      `/jobs/${jobId}/apply`,
      payload,
    );
  },

  getMyApplications() {
    return apiClient.get<
      ApiResponse<JobApplication[]>
    >("/my-job-applications");
  },

  getMyApplication(
    applicationId: string,
  ) {
    return apiClient.get<
      ApiResponse<JobApplication>
    >(
      `/my-job-applications/${applicationId}`,
    );
  },
};