import { jobApi } from "@/src/features/jobs/api/job.api";
import type {
  CompanyJobOnboardingValues,
  CompanyJobSubmitResult,
} from "@/src/features/jobs/schemas/company-job-onboarding.schema";
import type { PublicJobApplicationResult } from "@/src/features/jobs/schemas/public-job-application.schema";
import type { PublicJobApplicationFormValues } from "@/src/features/jobs/schemas/public-job-application.schema";

class JobService {
  async getJobs() {
    const response = await jobApi.getJobs();
    return response.data.data;
  }

  async getJob(slug: string) {
    const response = await jobApi.getJob(slug);
    return response.data.data;
  }

  async applyPublic(
    slug: string,
    values: PublicJobApplicationFormValues,
    resume: File,
  ): Promise<PublicJobApplicationResult> {
    const formData = new FormData();
    formData.append("applicantName", values.applicantName);
    formData.append("applicantEmail", values.applicantEmail);
    formData.append("applicantPhone", values.applicantPhone);
    formData.append("currentLocation", values.currentLocation);
    formData.append("highestQualification", values.highestQualification);
    formData.append("yearsOfExperience", String(values.yearsOfExperience));
    if (values.coverLetter?.trim()) {
      formData.append("coverLetter", values.coverLetter.trim());
    }
    formData.append("resume", resume);

    const response = await jobApi.applyPublic(slug, formData);
    return response.data.data;
  }

  async submitCompanyJob(
    values: CompanyJobOnboardingValues,
    logo?: File | null,
  ): Promise<CompanyJobSubmitResult> {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("companyName", values.companyName);
    formData.append("companyEmail", values.companyEmail);
    if (values.companyPhone?.trim()) {
      formData.append("companyPhone", values.companyPhone.trim());
    }
    if (values.companyWebsite?.trim()) {
      formData.append("companyWebsite", values.companyWebsite.trim());
    }
    formData.append("description", values.description);
    formData.append("location", values.location);
    formData.append("employmentType", values.employmentType);
    formData.append("workingDays", values.workingDays);
    formData.append("workMode", values.workMode);
    formData.append("category", values.category);
    if (values.department?.trim()) {
      formData.append("department", values.department.trim());
    }
    formData.append("minExperience", String(values.minExperience));
    formData.append("maxExperience", String(values.maxExperience));
    formData.append("minSalary", String(values.minSalary));
    formData.append("maxSalary", String(values.maxSalary));
    formData.append("vacancies", String(values.vacancies));
    formData.append("applicationDeadline", values.applicationDeadline);
    formData.append("skills", JSON.stringify(values.skills));
    formData.append(
      "preferredSkills",
      JSON.stringify(values.preferredSkills ?? []),
    );
    formData.append("qualifications", JSON.stringify(values.qualifications));
    if (values.responsibilities?.trim()) {
      formData.append(
        "responsibilities",
        JSON.stringify(
          values.responsibilities
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      );
    }
    if (values.benefits?.trim()) {
      formData.append("benefits", values.benefits.trim());
    }
    if (logo) {
      formData.append("logo", logo);
    }

    const response = await jobApi.submitCompanyJob(formData);
    return response.data.data;
  }
}

export const jobService = new JobService();
