import { apiClient } from "@/src/core/api/axios";

import type {
  AssignInterviewRequest,
  DeleteJobApplicationResponse,
  PermanentDeleteJobApplicationResponse,
  JobApplicationInterviewStatus,
  JobApplicationListResponse,
  JobApplicationResponse,
  JobApplicationStatus,
  JobApplicationStatusGroup,
  RestoreJobApplicationResponse,
  UpdateJobApplicationStatusRequest,
} from "@/src/features/job-applications/types/job-application.types";
import { enrichJobApplicationStudentCodes } from "@/src/features/job-applications/utils/resolve-job-application-student-code.utils";

export interface JobApplicationListQuery {
  search?: string;
  status?: JobApplicationStatus;
  statusGroup?: JobApplicationStatusGroup;
  interviewStatus?: JobApplicationInterviewStatus;
  jobId?: string;
  appliedFrom?: string;
  appliedTo?: string;
  studentId?: string;
  skip?: number;
  take?: number;
}

function resolveJobApplicationListTotal(
  response: JobApplicationListResponse,
  itemsLength: number,
): number {
  const metaTotal = response.meta?.total;

  if (typeof metaTotal === "number" && Number.isFinite(metaTotal)) {
    return metaTotal;
  }

  return itemsLength;
}

class JobApplicationService {
  async getJobApplications(params?: JobApplicationListQuery) {
    const { data } = await apiClient.get<JobApplicationListResponse>(
      "/admin/job-applications",
      {
        params: {
          search: params?.search || undefined,
          status: params?.statusGroup ? undefined : params?.status,
          statusGroup: params?.statusGroup || undefined,
          interviewStatus: params?.interviewStatus || undefined,
          jobId: params?.jobId || undefined,
          appliedFrom: params?.appliedFrom || undefined,
          appliedTo: params?.appliedTo || undefined,
          studentId: params?.studentId || undefined,
          skip: params?.skip,
          take: params?.take,
        },
      },
    );

    const items = Array.isArray(data.data) ? data.data : [];

    return {
      items: await enrichJobApplicationStudentCodes(items),
      total: resolveJobApplicationListTotal(data, items.length),
    };
  }

  async getJobApplication(id: string) {
    const { data } = await apiClient.get<JobApplicationResponse>(
      `/admin/job-applications/${id}`,
    );

    const [application] = await enrichJobApplicationStudentCodes(
      data.data ? [data.data] : [],
    );

    return {
      ...data,
      data: application ?? data.data,
    };
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

  async assignInterview(id: string, payload: AssignInterviewRequest) {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      data: unknown;
    }>(`/admin/job-applications/${id}/assign-interview`, payload);

    return data;
  }

  async unassignInterview(id: string) {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      data: unknown;
    }>(`/admin/job-applications/${id}/unassign-interview`);

    return data;
  }

  async deleteJobApplication(id: string) {
    const { data } = await apiClient.delete<DeleteJobApplicationResponse>(
      `/admin/job-applications/${id}`,
    );

    return data;
  }

  async permanentDeleteJobApplication(id: string) {
    const { data } =
      await apiClient.delete<PermanentDeleteJobApplicationResponse>(
        `/admin/job-applications/${id}/permanent`,
      );

    return data;
  }

  async restoreJobApplication(id: string) {
    const { data } = await apiClient.patch<RestoreJobApplicationResponse>(
      `/admin/job-applications/${id}/restore`,
    );

    return data;
  }

  async getResumeUpload(uploadId: string) {
    const { data } = await apiClient.get<{
      success: boolean;
      data: {
        id: string;
        url: string;
        originalName: string;
        mimeType: string;
        size: number;
      };
    }>(`/admin/uploads/${uploadId}`);

    return data.data;
  }
}

export const jobApplicationService = new JobApplicationService();
