import type {
  ApplicationStatus,
  ApplicationStudentSummary,
} from "@/src/features/student-jobs/types/apply-job.types";
import type { JobApplicationInterviewStatus } from "@/src/features/student-jobs/constants/interview-status.constants";

export type InterviewMode = "ONLINE" | "OFFLINE" | "PHONE";

export type InterviewRecordStatus =
  | "ASSIGNED"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface JobApplicationInterviewBranch {
  id: string;
  branchName: string;
  branchCode: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

export interface JobApplicationInterviewInterviewer {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
}

export interface JobApplicationInterviewAssignment {
  id: string;
  status: InterviewRecordStatus | string;
  branchId: string;
  interviewerId: string | null;
  scheduledAt: string | null;
  mode: InterviewMode | string | null;
  locationOrLink: string | null;
  roundNumber: number;
  notes: string | null;
  branch: JobApplicationInterviewBranch | null;
  interviewer: JobApplicationInterviewInterviewer | null;
}

export interface JobApplication {
  id: string;

  applicationNumber?: string;

  jobId: string;

  studentId: string;

  resumeFileId: string | null;

  coverLetter: string;

  currentLocation: string;

  expectedSalary: number | null;

  remarks: string;

  rejectionReason?: string | null;

  status: ApplicationStatus | string;

  interviewStatus?: JobApplicationInterviewStatus;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;

  job: JobApplicationJob;

  student: ApplicationStudentSummary;

  interviewAssignment?: JobApplicationInterviewAssignment | null;
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
