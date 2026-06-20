import type {
  Job,
} from "@/src/features/jobs/types/job.types";

export interface ApplyJobRequest {
  coverLetter: string;
  currentLocation: string;
  expectedSalary: number;
  remarks: string;
}

export interface ApplyJobFormValues {
  coverLetter: string;
  currentLocation: string;
  expectedSalary: number;
  remarks: string;
}

export interface ApplyJobResponse {
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

  job: ApplicationJobSummary;

  student: ApplicationStudentSummary;

  createdAt: string;
  updatedAt: string;
}

export interface ApplicationJobSummary
  extends Pick<
    Job,
    | "id"
    | "title"
    | "slug"
    | "companyName"
    | "employmentType"
  > {
  status: string;
}

export interface ApplicationStudentSummary {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  studentCode: string;

  status: StudentAdmissionStatus;
}

export type StudentAdmissionStatus =
  | "PENDING"
  | "ADMITTED"
  | "REJECTED"
  | "SUSPENDED";

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "SELECTED"
  | "REJECTED"
  | "HIRED"
  | "WITHDRAWN";