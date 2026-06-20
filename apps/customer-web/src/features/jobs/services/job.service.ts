import { jobApi } from "@/src/features/jobs/api/job.api";

class JobService {
  async getJobs() {
    const response =
      await jobApi.getJobs();

    return response.data.data;
  }

  async getJob(
    slug: string,
  ) {
    const response =
      await jobApi.getJob(
        slug,
      );

    return response.data.data;
  }
}

export const jobService =
  new JobService();