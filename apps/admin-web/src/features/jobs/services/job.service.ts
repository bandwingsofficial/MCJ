import { apiClient } from "@/src/core/api/axios";

import type {
  CompanyJobSubmitResponse,
  CompanyJobSubmitResult,
  CreateJobRequest,
  DeleteJobResponse,
  Job,
  JobListQuery,
  JobListResponse,
  JobListResult,
  JobResponse,
  PermanentDeleteJobResponse,
  PublicJobApplicationResult,
  UpdateJobRequest,
} from "@/src/features/jobs/types/job.types";

function resolveJobListTotal(response: JobListResponse): number {
  if (typeof response.meta?.total === "number") {
    return response.meta.total;
  }

  return response.data?.length ?? 0;
}

class JobService {
  async getJobs(params?: JobListQuery): Promise<JobListResult> {
    const { data } = await apiClient.get<JobListResponse>("/admin/jobs", {
      params: {
        search: params?.search || undefined,
        isActive: params?.isActive,
        includeDeleted: params?.includeDeleted,
        onlyDeleted: params?.onlyDeleted,
        skip: params?.skip,
        take: params?.take,
        status: params?.status,
        source: params?.source,
        catalogOnly: params?.catalogOnly,
        onboardingQueue: params?.onboardingQueue,
      },
    });

    return {
      items: Array.isArray(data.data) ? data.data : [],
      total: resolveJobListTotal(data),
    };
  }

  async getPublicJobBySlug(slug: string): Promise<Job> {
    const { data } = await apiClient.get<JobResponse>(
      `/jobs/${encodeURIComponent(slug)}`,
    );
    return data.data;
  }

  async applyPublicJob(
    slug: string,
    formData: FormData,
  ): Promise<PublicJobApplicationResult> {
    const { data } = await apiClient.post<{
      success: boolean;
      message: string;
      data: PublicJobApplicationResult;
    }>(`/jobs/${encodeURIComponent(slug)}/public-apply`, formData, {
      headers: {
        "Content-Type": undefined,
      },
      transformRequest: [(body) => body],
    });

    return data.data;
  }

  async getJob(id: string) {
    const { data } = await apiClient.get<JobResponse>(`/admin/jobs/${id}`);
    return data;
  }

  async createJob(payload: CreateJobRequest, image?: File | null) {
    const requestPayload: CreateJobRequest = { ...payload };

    if (image) {
      const uploadResponse = await this.uploadJobLogo(image);
      requestPayload.companyLogo = uploadResponse.data.url;
    }

    const { data } = await apiClient.post<JobResponse>(
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
    const requestPayload: UpdateJobRequest = { ...payload };

    if (image) {
      const uploadResponse = await this.uploadJobLogo(image);
      requestPayload.companyLogo = uploadResponse.data.url;
    }

    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}`,
      requestPayload,
    );

    return data;
  }

  async approveJob(id: string) {
    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}/approve`,
    );
    return data;
  }

  async rejectJob(id: string, reason?: string) {
    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}/reject`,
      { reason: reason || undefined },
    );
    return data;
  }

  async activateJob(id: string) {
    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}/activate`,
    );
    return data;
  }

  async deactivateJob(id: string) {
    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}/deactivate`,
    );
    return data;
  }

  async restoreJob(id: string) {
    const { data } = await apiClient.patch<JobResponse>(
      `/admin/jobs/${id}/restore`,
    );
    return data;
  }

  async deleteJob(id: string) {
    const { data } = await apiClient.delete<DeleteJobResponse>(
      `/admin/jobs/${id}`,
    );
    return data;
  }

  async permanentlyDeleteJob(id: string) {
    const { data } = await apiClient.delete<PermanentDeleteJobResponse>(
      `/admin/jobs/${id}/permanent`,
    );
    return data;
  }

  async submitCompanyJob(
    payload: CreateJobRequest,
    image?: File | null,
  ): Promise<CompanyJobSubmitResult> {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("companyName", payload.companyName);
    formData.append("companyEmail", payload.companyEmail);
    if (payload.companyPhone?.trim()) {
      formData.append("companyPhone", payload.companyPhone.trim());
    }
    if (payload.companyWebsite?.trim()) {
      formData.append("companyWebsite", payload.companyWebsite.trim());
    }
    if (payload.companyDescription?.trim()) {
      formData.append("companyDescription", payload.companyDescription.trim());
    }
    if (payload.shortDescription?.trim()) {
      formData.append("shortDescription", payload.shortDescription.trim());
    }
    formData.append("description", payload.description);
    formData.append("location", payload.location);
    if (payload.city?.trim()) {
      formData.append("city", payload.city.trim());
    }
    if (payload.state?.trim()) {
      formData.append("state", payload.state.trim());
    }
    if (payload.country?.trim()) {
      formData.append("country", payload.country.trim());
    }
    formData.append("employmentType", payload.employmentType);
    formData.append("workingDays", payload.workingDays);
    formData.append("workMode", payload.workMode);
    formData.append("category", payload.category);
    if (payload.department?.trim()) {
      formData.append("department", payload.department.trim());
    }
    formData.append("minExperience", String(payload.minExperience));
    formData.append(
      "maxExperience",
      String(payload.maxExperience ?? payload.minExperience),
    );
    formData.append("minSalary", String(payload.minSalary));
    if (payload.maxSalary != null) {
      formData.append("maxSalary", String(payload.maxSalary));
    }
    formData.append("salaryCurrency", payload.salaryCurrency || "INR");
    formData.append("vacancies", String(payload.vacancies || 1));
    formData.append("applicationDeadline", payload.applicationDeadline);
    formData.append("skills", JSON.stringify(payload.skills ?? []));
    formData.append(
      "preferredSkills",
      JSON.stringify(payload.preferredSkills ?? []),
    );
    formData.append(
      "qualifications",
      JSON.stringify(payload.qualifications ?? []),
    );
    formData.append(
      "responsibilities",
      JSON.stringify(payload.responsibilities ?? []),
    );
    if (payload.benefits?.trim()) {
      formData.append("benefits", payload.benefits.trim());
    }
    if (payload.interviewProcess?.length) {
      formData.append(
        "interviewProcess",
        JSON.stringify(payload.interviewProcess),
      );
    }
    if (image) {
      formData.append("logo", image);
    }

    const { data } = await apiClient.post<CompanyJobSubmitResponse>(
      "/jobs/company-submit",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(body) => body],
      },
    );

    return data.data;
  }

  async uploadJobLogo(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "jobs");
    formData.append("fileName", file.name);

    const response = await apiClient.post("/admin/uploads", formData, {
      headers: {
        "Content-Type": undefined,
      },
      transformRequest: [(data) => data],
    });

    return response.data;
  }
}

export const jobService = new JobService();
