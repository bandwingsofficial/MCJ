import { studentJobApi } from "@/src/features/student-jobs/api";

import type {
  ApplyJobRequest,
  ApplyJobResponse,
  JobApplication,
} from "@/src/features/student-jobs/types";

class StudentJobService {
  async applyJob(
    jobId: string,
    payload: ApplyJobRequest,
  ): Promise<ApplyJobResponse> {
    const response =
      await studentJobApi.applyJob(
        jobId,
        payload,
      );

    return response.data.data;
  }

  async getMyApplications(): Promise<
    JobApplication[]
  > {
    const response =
      await studentJobApi.getMyApplications();

    return response.data.data;
  }

  async getMyApplication(
    applicationId: string,
  ): Promise<JobApplication> {
    const response =
      await studentJobApi.getMyApplication(
        applicationId,
      );

    return response.data.data;
  }
}

export const studentJobService =
  new StudentJobService();