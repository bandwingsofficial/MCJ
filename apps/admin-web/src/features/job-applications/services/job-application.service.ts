import { apiClient } from "@/src/core/api/axios";

import type {
  DeleteJobApplicationResponse,
  JobApplicationListResponse,
  JobApplicationResponse,
  RestoreJobApplicationResponse,
  UpdateJobApplicationStatusRequest,
} from "@/src/features/job-applications/types/job-application.types";

class JobApplicationService {
  async getJobApplications() {
    const { data } =
      await apiClient.get<JobApplicationListResponse>(
        "/admin/job-applications",
      );

    return data;
  }

  async getJobApplication(
    id: string,
  ) {
    const { data } =
      await apiClient.get<JobApplicationResponse>(
        `/admin/job-applications/${id}`,
      );

    return data;
  }

  async updateStatus(
    id: string,
    payload: UpdateJobApplicationStatusRequest,
  ) {
    const { data } =
      await apiClient.patch<JobApplicationResponse>(
        `/admin/job-applications/${id}/status`,
        payload,
      );

    return data;
  }

  async deleteJobApplication(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<DeleteJobApplicationResponse>(
        `/admin/job-applications/${id}`,
      );

    return data;
  }

  async restoreJobApplication(
    id: string,
  ) {
    const { data } =
      await apiClient.patch<RestoreJobApplicationResponse>(
        `/admin/job-applications/${id}/restore`,
      );

    return data;
  }
}

export const jobApplicationService =
  new JobApplicationService();