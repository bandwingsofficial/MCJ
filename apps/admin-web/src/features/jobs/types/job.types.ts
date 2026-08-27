export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";

export type WorkingDays =
  | "ONE_DAY"
  | "TWO_DAYS"
  | "THREE_DAYS"
  | "FOUR_DAYS"
  | "FIVE_DAYS"
  | "SIX_DAYS"
  | "MONDAY_TO_FRIDAY"
  | "MONDAY_TO_SATURDAY";

export type JobStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "CLOSED"
  | "EXPIRED"
  | "REJECTED";

export type JobSource = "ADMIN" | "COMPANY_ONBOARDING";

export type JobWorkMode = "ONSITE" | "REMOTE" | "HYBRID";

export type JobLifecycleStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type JobOnboardingStatusFilter =
  | "ALL"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export interface InterviewProcess {
  title: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  jobNumber: string | null;
  source: JobSource;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  companyDescription: string | null;
  description: string | null;
  shortDescription: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isRemote?: boolean;
  workMode: JobWorkMode;
  employmentType: EmploymentType;
  workingDays: WorkingDays;
  category: string | null;
  department: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string;
  vacancies: number;
  applicationDeadline: string | null;
  responsibilities: string[];
  skills: string[];
  preferredSkills: string[];
  qualifications: string[];
  benefits: string | null;
  eligibilityTitle: string | null;
  interviewProcess: InterviewProcess[];
  status: JobStatus;
  isActive: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isAcceptingApplications: boolean;
}

export function isJobExpired(
  job: Pick<Job, "applicationDeadline" | "isExpired">,
): boolean {
  if (typeof job.isExpired === "boolean") {
    return job.isExpired;
  }

  if (!job.applicationDeadline) {
    return false;
  }

  return new Date(job.applicationDeadline) < new Date();
}

export function isJobAcceptingApplications(
  job: Pick<
    Job,
    | "isActive"
    | "status"
    | "isDeleted"
    | "applicationDeadline"
    | "isExpired"
    | "isAcceptingApplications"
  >,
): boolean {
  if (typeof job.isAcceptingApplications === "boolean") {
    return job.isAcceptingApplications;
  }

  return (
    job.isActive &&
    job.status === "ACTIVE" &&
    !job.isDeleted &&
    !isJobExpired(job)
  );
}

export interface PublicJobApplicationResult {
  id: string;
  applicationNumber: string;
  createdAt: string;
  status: string;
  job?: {
    title: string;
    jobNumber?: string | null;
    companyName?: string;
  };
}

export interface CreateJobRequest {
  title: string;
  status?: JobStatus;
  companyName: string;
  companyEmail: string;
  companyPhone?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companyLogo?: string;
  description: string;
  shortDescription?: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  workMode: JobWorkMode;
  employmentType: EmploymentType;
  workingDays: WorkingDays;
  category: string;
  department?: string;
  minExperience: number;
  maxExperience?: number;
  minSalary: number;
  maxSalary?: number;
  salaryCurrency: string;
  vacancies: number;
  applicationDeadline: string;
  responsibilities?: string[];
  skills: string[];
  preferredSkills?: string[];
  qualifications: string[];
  benefits?: string;
  eligibilityTitle?: string;
  interviewProcess?: InterviewProcess[];
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    skip?: number;
    take?: number;
  };
}

export type JobResponse = ApiResponse<Job>;

export type JobListResponse = ApiResponse<Job[]>;

export interface JobListQuery {
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  onlyDeleted?: boolean;
  skip?: number;
  take?: number;
  status?: JobStatus;
  source?: JobSource;
  catalogOnly?: boolean;
}

export interface JobListResult {
  items: Job[];
  total: number;
}

export interface JobFilters {
  search: string;
  status?: JobLifecycleStatus;
  page: number;
  pageSize: number;
}

export interface JobOnboardingFilters {
  search: string;
  status: JobOnboardingStatusFilter;
  page: number;
  pageSize: number;
}

export interface DeleteJobData {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export type DeleteJobResponse = ApiResponse<DeleteJobData>;

export interface PermanentDeleteJobData {
  id: string;
  permanentlyDeleted: boolean;
}

export type PermanentDeleteJobResponse = ApiResponse<PermanentDeleteJobData>;

export interface CompanyJobSubmitResult {
  id: string;
  title: string;
  companyName: string;
  status: JobStatus;
  createdAt: string;
}

export type CompanyJobSubmitResponse = ApiResponse<CompanyJobSubmitResult>;
