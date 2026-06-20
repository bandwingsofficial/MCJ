import { apiClient } from "@/src/core/api/axios";

import type {
  CreateJobRequest,
  DeleteJobResponse,
  JobListResponse,
  JobResponse,
  PermanentDeleteJobResponse,
  UpdateJobRequest,
} from "@/src/features/jobs/types/job.types";

class JobService {
  async getJobs() {
    const { data } =
      await apiClient.get<JobListResponse>(
        "/admin/jobs",
      );

    return data;
  }

  async getJob(id: string) {
    const { data } =
      await apiClient.get<JobResponse>(
        `/admin/jobs/${id}`,
      );

    return data;
  }

  async createJob(
    payload: CreateJobRequest,
  ) {
    const { data } =
      await apiClient.post<JobResponse>(
        "/admin/jobs",
        payload,
      );

    return data;
  }

  async updateJob(
    id: string,
    payload: UpdateJobRequest,
  ) {
    const { data } =
      await apiClient.patch<JobResponse>(
        `/admin/jobs/${id}`,
        payload,
      );

    return data;
  }

  async activateJob(id: string) {
    const { data } =
      await apiClient.patch<JobResponse>(
        `/admin/jobs/${id}/activate`,
      );

    return data;
  }

  async deactivateJob(id: string) {
    const { data } =
      await apiClient.patch<JobResponse>(
        `/admin/jobs/${id}/deactivate`,
      );

    return data;
  }

  async restoreJob(id: string) {
    const { data } =
      await apiClient.patch<JobResponse>(
        `/admin/jobs/${id}/restore`,
      );

    return data;
  }

  async deleteJob(id: string) {
    const { data } =
      await apiClient.delete<DeleteJobResponse>(
        `/admin/jobs/${id}`,
      );

    return data;
  }

  async permanentlyDeleteJob(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<PermanentDeleteJobResponse>(
        `/admin/jobs/${id}/permanent`,
      );

    return data;
  }
}

export const jobService =
  new JobService();