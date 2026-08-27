export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "CONTRACT";

export type WorkingDays =
  | "MONDAY_TO_FRIDAY"
  | "MONDAY_TO_SATURDAY"
  | "ONE_DAY"
  | "TWO_DAYS"
  | "THREE_DAYS"
  | "FOUR_DAYS"
  | "FIVE_DAYS"
  | "SIX_DAYS";

export type JobWorkMode = "ONSITE" | "REMOTE" | "HYBRID";

export type JobStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "CLOSED"
  | "EXPIRED"
  | "REJECTED";

export interface InterviewProcess {
  title: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  jobNumber?: string | null;
  companyName: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyDescription: string | null;
  description: string | null;
  shortDescription: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isRemote: boolean;
  workMode?: JobWorkMode;
  employmentType: EmploymentType;
  workingDays: WorkingDays;
  category?: string | null;
  department?: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string;
  vacancies: number;
  applicationDeadline: string | null;
  responsibilities: string[];
  skills: string[];
  preferredSkills?: string[];
  qualifications?: string[];
  benefits?: string | null;
  eligibilityTitle: string | null;
  interviewProcess: InterviewProcess[];
  status: JobStatus;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isExpired?: boolean;
  isAcceptingApplications?: boolean;
}

export function isJobExpired(job: Pick<Job, "applicationDeadline" | "isExpired">): boolean {
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
