import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type { EmploymentType, Job } from "@/src/features/jobs/types/job.types";

export type JobListRequestParams = {
  search?: string;
  employmentType?: EmploymentType;
  filterMinExperience?: number;
  filterMaxExperience?: number;
  skip?: number;
  take?: number;
};

type JobsListApiResponse = ApiResponse<Job[]> & {
  meta?: {
    total: number;
    skip: number;
    take: number | null;
  };
};
import type { CompanyJobSubmitResult } from "@/src/features/jobs/schemas/company-job-onboarding.schema";
import type { JobApplicationSubmitResult } from "@/src/features/jobs/schemas/job-application-student.schema";
import type { PublicJobApplicationResult } from "@/src/features/jobs/schemas/public-job-application.schema";

export const jobApi = {
  getJobs(params?: JobListRequestParams) {
    return apiClient.get<JobsListApiResponse>("/jobs", { params });
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

  applyWithStudent(slug: string, formData: FormData) {
    return apiClient.post<ApiResponse<JobApplicationSubmitResult>>(
      `/jobs/${encodeURIComponent(slug)}/student-apply`,
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
