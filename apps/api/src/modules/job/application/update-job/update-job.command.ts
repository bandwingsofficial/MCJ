import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { JobWorkMode } from '../../domain/enums/job-work-mode.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';
import { InterviewProcessStep } from '../../domain/entities/job.entity';

export interface UpdateJobInput {
  id: string;
  title?: string;
  slug?: string;
  companyName?: string;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  companyEmail?: string | null;
  companyPhone?: string | null;
  companyDescription?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isRemote?: boolean;
  workMode?: JobWorkMode;
  employmentType?: EmploymentType;
  workingDays?: WorkingDays;
  category?: string | null;
  department?: string | null;
  minExperience?: number | null;
  maxExperience?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryCurrency?: string;
  vacancies?: number;
  applicationDeadline?: Date | null;
  responsibilities?: string[];
  skills?: string[];
  preferredSkills?: string[];
  qualifications?: string[];
  benefits?: string | null;
  eligibilityTitle?: string | null;
  interviewProcess?: InterviewProcessStep[];
  status?: JobStatus;
  updatedBy?: string;
}

export class UpdateJobCommand {
  constructor(public readonly input: UpdateJobInput) {}
}
