import type {
  ApplicationStatus,
  ApplicationStudentSummary,
} from "@/src/features/student-jobs/types/apply-job.types";

export interface JobApplication {
  id: string;

  jobId: string;

  studentId: string;

  resumeFileId: string | null;

  coverLetter: string;

  currentLocation: string;

  expectedSalary: number;

  remarks: string;

  status: ApplicationStatus;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;

  job: JobApplicationJob;

  student: ApplicationStudentSummary;
}

export interface JobApplicationJob {
  id: string;

  slug: string;

  title: string;

  companyName: string;

  employmentType: string;

  status: string;
}

export interface JobApplicationListResponse {
  applications: JobApplication[];
}

export interface JobApplicationDetailsResponse {
  application: JobApplication;
}