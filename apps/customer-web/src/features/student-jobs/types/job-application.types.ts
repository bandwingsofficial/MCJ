import type {
  ApplicationStatus,
  ApplicationStudentSummary,
} from "@/src/features/student-jobs/types/apply-job.types";
import type { JobApplicationInterviewStatus } from "@/src/features/student-jobs/constants/interview-status.constants";

export interface JobApplication {
  id: string;

  jobId: string;

  studentId: string;

  resumeFileId: string | null;

  coverLetter: string;

  currentLocation: string;

  expectedSalary: number | null;

  remarks: string;

  status: ApplicationStatus;

  interviewStatus?: JobApplicationInterviewStatus;

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