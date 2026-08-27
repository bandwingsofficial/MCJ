import { apiClient } from "@/src/core/api/axios";

import type {
  DeleteJobApplicationResponse,
  JobApplicationListResponse,
  JobApplicationResponse,
  JobApplicationStatus,
  RestoreJobApplicationResponse,
  UpdateJobApplicationStatusRequest,
} from "@/src/features/job-applications/types/job-application.types";

export interface JobApplicationListQuery {
  search?: string;
  status?: JobApplicationStatus;
  skip?: number;
  take?: number;
}

class JobApplicationService {
  async getJobApplications(params?: JobApplicationListQuery) {
    const { data } = await apiClient.get<JobApplicationListResponse>(
      "/admin/job-applications",
      {
        params: {
          search: params?.search || undefined,
          status: params?.status,
          skip: params?.skip,
          take: params?.take,
        },
      },
    );

    return {
      items: Array.isArray(data.data) ? data.data : [],
      total:
        typeof data.meta?.total === "number"
          ? data.meta.total
          : data.data?.length ?? 0,
    };
  }

  async getJobApplication(id: string) {
    const { data } = await apiClient.get<JobApplicationResponse>(
      `/admin/job-applications/${id}`,
    );

    return data;
  }

  async updateStatus(
    id: string,
    payload: UpdateJobApplicationStatusRequest,
  ) {
    const { data } = await apiClient.patch<JobApplicationResponse>(
      `/admin/job-applications/${id}/status`,
      payload,
    );

    return data;
  }

  async deleteJobApplication(id: string) {
    const { data } = await apiClient.delete<DeleteJobApplicationResponse>(
      `/admin/job-applications/${id}`,
    );

    return data;
  }

  async restoreJobApplication(id: string) {
    const { data } = await apiClient.patch<RestoreJobApplicationResponse>(
      `/admin/job-applications/${id}/restore`,
    );

    return data;
  }
}

export const jobApplicationService = new JobApplicationService();
