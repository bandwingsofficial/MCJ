export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";

export type WorkingDays =
  | "MONDAY_TO_FRIDAY"
  | "MONDAY_TO_SATURDAY"
  | "FLEXIBLE";

export type JobStatus =
  | "DRAFT"
  | "ACTIVE"
  | "CLOSED"
  | "EXPIRED";

export interface InterviewProcess {
  title: string;
  description: string;
}

export interface Job {
  id: string;

  title: string;

  slug: string;

  companyName: string;

  companyLogo: string | null;

  companyWebsite: string | null;

  companyDescription: string | null;

  description: string;

  shortDescription: string | null;

  location: string;

  city: string;

  state: string;

  country: string;

  isRemote: boolean;

  employmentType: EmploymentType;

  workingDays: WorkingDays;

  minExperience: number;

  maxExperience: number;

  minSalary: number;

  maxSalary: number;

  salaryCurrency: string;

  vacancies: number;

  applicationDeadline: string;

  responsibilities: string[];

  skills: string[];

  eligibilityTitle: string;

  interviewProcess: InterviewProcess[];

  status: JobStatus;

  isActive: boolean;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateJobRequest {
  title: string;
  status?: JobStatus;
  companyName: string;

  description: string;

  location: string;

  city: string;

  state: string;

  country: string;

  isRemote: boolean;

  employmentType: EmploymentType;

  workingDays: WorkingDays;

  minExperience: number;

  maxExperience: number;

  minSalary: number;

  maxSalary: number;

  salaryCurrency: string;

  vacancies: number;

  applicationDeadline: string;

  responsibilities: string[];

  skills: string[];

  eligibilityTitle: string;

  interviewProcess: InterviewProcess[];

  companyLogo?: string;

  companyWebsite?: string;

  companyDescription?: string;

  shortDescription?: string;
}

export interface UpdateJobRequest
  extends Partial<CreateJobRequest> {
  status?: JobStatus;
}

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export type JobResponse = ApiResponse<Job>;

export type JobListResponse = ApiResponse<Job[]>;

export interface DeleteJobData {
  id: string;

  deleted: boolean;

  deletedAt: string;
}

export type DeleteJobResponse =
  ApiResponse<DeleteJobData>;

export interface PermanentDeleteJobData {
  id: string;

  permanentlyDeleted: boolean;
}

export type PermanentDeleteJobResponse =
  ApiResponse<PermanentDeleteJobData>;