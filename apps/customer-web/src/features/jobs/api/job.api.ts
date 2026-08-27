import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type { Job } from "@/src/features/jobs/types/job.types";
import type { CompanyJobSubmitResult } from "@/src/features/jobs/schemas/company-job-onboarding.schema";
import type { PublicJobApplicationResult } from "@/src/features/jobs/schemas/public-job-application.schema";

export const jobApi = {
  getJobs() {
    return apiClient.get<ApiResponse<Job[]>>("/jobs");
  },

  getJob(slug: string) {
    return apiClient.get<ApiResponse<Job>>(`/jobs/${slug}`);
  },

  applyPublic(slug: string, formData: FormData) {
    return apiClient.post<ApiResponse<PublicJobApplicationResult>>(
      `/jobs/${encodeURIComponent(slug)}/public-apply`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data) => data],
      },
    );
  },

  submitCompanyJob(formData: FormData) {
    return apiClient.post<ApiResponse<CompanyJobSubmitResult>>(
      "/jobs/company-submit",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data) => data],
      },
    );
  },
};
