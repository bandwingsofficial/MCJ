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
    image?: File | null,
  ) {
    const requestPayload: CreateJobRequest =
      {
        ...payload,
      };

    if (image) {
      const uploadResponse =
        await this.uploadJobLogo(
          image,
        );

requestPayload.companyLogo =
  uploadResponse.data.url;
    }

    const { data } =
      await apiClient.post<JobResponse>(
        "/admin/jobs",
        requestPayload,
      );

    return data;
  }

  async updateJob(
    id: string,
    payload: UpdateJobRequest,
    image?: File | null,
  ) {
    const requestPayload: UpdateJobRequest =
      {
        ...payload,
      };

    if (image) {
      const uploadResponse =
        await this.uploadJobLogo(
          image,
        );

   requestPayload.companyLogo =
  uploadResponse.data.url;
    }

    const { data } =
      await apiClient.patch<JobResponse>(
        `/admin/jobs/${id}`,
        requestPayload,
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

  async uploadJobLogo(
    file: File,
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "folder",
      "jobs",
    );

    formData.append(
      "fileName",
      file.name,
    );

    const response =
      await apiClient.post(
        "/admin/uploads",
        formData,
        {
          headers: {
            "Content-Type":
              undefined,
          },
          transformRequest: [
            (data) => data,
          ],
        },
      );

    return response.data;
  }
}

export const jobService =
  new JobService();