export type JobApplicationStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "SELECTED"
  | "PLACED";

export interface JobSummary {
  id: string;

  title: string;

  slug: string;

  companyName: string;

  status: string;

  employmentType: string;
}

export interface StudentSummary {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  studentCode: string;

  status: string;
}

export interface JobApplication {
  id: string;

  jobId: string;

  studentId: string;

  resumeFileId: string | null;

  coverLetter: string | null;

  currentLocation: string | null;

  expectedSalary: number | null;

  remarks: string | null;

  status: JobApplicationStatus;

  isDeleted: boolean;

  deletedAt: string | null;

  job: JobSummary;

  student: StudentSummary;

  createdAt: string;

  updatedAt: string;
}

export interface JobApplicationListResponse {
  success: boolean;

  message: string;

  data: JobApplication[];
}

export interface JobApplicationResponse {
  success: boolean;

  message: string;

  data: JobApplication;
}

export interface UpdateJobApplicationStatusRequest {
  status: JobApplicationStatus;
}

export interface DeleteJobApplicationResponse {
  success: boolean;

  message: string;
}

export interface RestoreJobApplicationResponse {
  success: boolean;

  message: string;

  data: JobApplication;
}