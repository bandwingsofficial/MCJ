import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

export const jobApi = {
  getJobs() {
    return apiClient.get<
      ApiResponse<Job[]>
    >("/jobs");
  },

  getJob(
    slug: string,
  ) {
    return apiClient.get<
      ApiResponse<Job>
    >(`/jobs/${slug}`);
  },
};