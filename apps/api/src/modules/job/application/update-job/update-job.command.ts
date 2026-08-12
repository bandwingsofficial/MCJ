import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { InterviewProcessStep } from '../../domain/entities/job.entity';

export class UpdateJobCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly slug?: string,
    public readonly companyName?: string,
    public readonly companyLogo?: string | null,
    public readonly companyWebsite?: string | null,
    public readonly companyDescription?: string | null,
    public readonly description?: string | null,
    public readonly shortDescription?: string | null,
    public readonly location?: string | null,
    public readonly city?: string | null,
    public readonly state?: string | null,
    public readonly country?: string | null,
    public readonly isRemote?: boolean,
    public readonly employmentType?: EmploymentType,
    public readonly workingDays?: WorkingDays,
    public readonly minExperience?: number | null,
    public readonly maxExperience?: number | null,
    public readonly minSalary?: number | null,
    public readonly maxSalary?: number | null,
    public readonly salaryCurrency?: string,
    public readonly vacancies?: number,
    public readonly applicationDeadline?: Date | null,
    public readonly responsibilities?: string[],
    public readonly skills?: string[],
    public readonly eligibilityTitle?: string | null,
    public readonly interviewProcess?: InterviewProcessStep[],
    public readonly status?: JobStatus,
    public readonly updatedBy?: string,
  ) {}
}
