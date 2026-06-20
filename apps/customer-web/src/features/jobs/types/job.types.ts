export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "INTERNSHIP"
  | "CONTRACT"
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