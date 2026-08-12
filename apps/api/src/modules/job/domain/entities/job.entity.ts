import { EmploymentType } from '../enums/employment-type.enum';
import { JobStatus } from '../enums/job-status.enum';
import { WorkingDays } from '../enums/working-days.enum';
import { CompanyName } from '../value-objects/company-name.vo';
import { ExperienceRange } from '../value-objects/experience-range.vo';
import { JobTitle } from '../value-objects/job-title.vo';
import { Location } from '../value-objects/location.vo';
import { SalaryRange } from '../value-objects/salary-range.vo';
import { Slug } from '../value-objects/slug.vo';

export interface InterviewProcessStep {
  title: string;
  description: string;
}

export class Job {
  private constructor(
    public readonly id: string,
    public title: JobTitle,
    public slug: Slug,
    public companyName: CompanyName,
    public companyLogo: string | null,
    public companyWebsite: string | null,
    public companyDescription: string | null,
    public description: string | null,
    public shortDescription: string | null,
    public location: Location,
    public isRemote: boolean,
    public employmentType: EmploymentType,
    public workingDays: WorkingDays,
    public experience: ExperienceRange,
    public salary: SalaryRange,
    public vacancies: number,
    public applicationDeadline: Date | null,
    public responsibilities: string[],
    public skills: string[],
    public eligibilityTitle: string | null,
    public interviewProcess: InterviewProcessStep[],
    public status: JobStatus,
    public isActive: boolean,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: JobCreateParams): Job {
    return new Job(
      params.id,
      JobTitle.create(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      CompanyName.create(params.companyName),
      params.companyLogo ?? null,
      params.companyWebsite ?? null,
      params.companyDescription ?? null,
      params.description ?? null,
      params.shortDescription ?? null,
      Location.create(params),
      params.isRemote ?? false,
      params.employmentType,
      params.workingDays,
      ExperienceRange.create(params.minExperience, params.maxExperience),
      SalaryRange.create(
        params.minSalary,
        params.maxSalary,
        params.salaryCurrency,
      ),
      params.vacancies ?? 1,
      params.applicationDeadline ?? null,
      params.responsibilities ?? [],
      params.skills ?? [],
      params.eligibilityTitle ?? null,
      params.interviewProcess ?? [],
      params.status ?? JobStatus.DRAFT,
      params.isActive ?? true,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: JobReconstituteParams): Job {
    return new Job(
      params.id,
      JobTitle.create(params.title),
      Slug.create(params.slug),
      CompanyName.create(params.companyName),
      params.companyLogo,
      params.companyWebsite,
      params.companyDescription,
      params.description,
      params.shortDescription,
      Location.create(params),
      params.isRemote,
      params.employmentType,
      params.workingDays,
      ExperienceRange.create(params.minExperience, params.maxExperience),
      SalaryRange.create(
        params.minSalary,
        params.maxSalary,
        params.salaryCurrency,
      ),
      params.vacancies,
      params.applicationDeadline,
      params.responsibilities,
      params.skills,
      params.eligibilityTitle,
      params.interviewProcess,
      params.status,
      params.isActive,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: JobUpdateParams) {
    if (params.title !== undefined) {
      this.title = JobTitle.create(params.title);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.companyName !== undefined) {
      this.companyName = CompanyName.create(params.companyName);
    }
    if (params.companyLogo !== undefined) {
      this.companyLogo = params.companyLogo;
    }
    if (params.companyWebsite !== undefined) {
      this.companyWebsite = params.companyWebsite;
    }
    if (params.companyDescription !== undefined) {
      this.companyDescription = params.companyDescription;
    }
    if (params.description !== undefined) {
      this.description = params.description;
    }
    if (params.shortDescription !== undefined) {
      this.shortDescription = params.shortDescription;
    }
    if (
      params.location !== undefined ||
      params.city !== undefined ||
      params.state !== undefined ||
      params.country !== undefined
    ) {
      this.location = Location.create({
        location: params.location ?? this.location.getLocation(),
        city: params.city ?? this.location.getCity(),
        state: params.state ?? this.location.getState(),
        country: params.country ?? this.location.getCountry(),
      });
    }
    if (params.isRemote !== undefined) this.isRemote = params.isRemote;
    if (params.employmentType !== undefined) {
      this.employmentType = params.employmentType;
    }
    if (params.workingDays !== undefined) {
      this.workingDays = params.workingDays;
    }
    if (
      params.minExperience !== undefined ||
      params.maxExperience !== undefined
    ) {
      this.experience = ExperienceRange.create(
        params.minExperience ?? this.experience.getMin(),
        params.maxExperience ?? this.experience.getMax(),
      );
    }
    if (
      params.minSalary !== undefined ||
      params.maxSalary !== undefined ||
      params.salaryCurrency !== undefined
    ) {
      this.salary = SalaryRange.create(
        params.minSalary ?? this.salary.getMin(),
        params.maxSalary ?? this.salary.getMax(),
        params.salaryCurrency ?? this.salary.getCurrency(),
      );
    }
    if (params.vacancies !== undefined) this.vacancies = params.vacancies;
    if (params.applicationDeadline !== undefined) {
      this.applicationDeadline = params.applicationDeadline;
    }
    if (params.responsibilities !== undefined) {
      this.responsibilities = params.responsibilities;
    }
    if (params.skills !== undefined) this.skills = params.skills;
    if (params.eligibilityTitle !== undefined) {
      this.eligibilityTitle = params.eligibilityTitle;
    }
    if (params.interviewProcess !== undefined) {
      this.interviewProcess = params.interviewProcess;
    }
    if (params.status !== undefined) this.status = params.status;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  isPubliclyVisible(): boolean {
    return (
      !this.isDeleted &&
      this.isActive &&
      this.status === JobStatus.ACTIVE
    );
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface JobCreateParams {
  id: string;
  title: string;
  slug?: string;
  companyName: string;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  companyDescription?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  isRemote?: boolean;
  employmentType: EmploymentType;
  workingDays: WorkingDays;
  minExperience?: number | null;
  maxExperience?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  salaryCurrency?: string;
  vacancies?: number;
  applicationDeadline?: Date | null;
  responsibilities?: string[];
  skills?: string[];
  eligibilityTitle?: string | null;
  interviewProcess?: InterviewProcessStep[];
  status?: JobStatus;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface JobUpdateParams
  extends Partial<Omit<JobCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}

export interface JobReconstituteParams
  extends Required<
    Omit<
      JobCreateParams,
      | 'slug'
      | 'companyLogo'
      | 'companyWebsite'
      | 'companyDescription'
      | 'description'
      | 'shortDescription'
      | 'location'
      | 'city'
      | 'state'
      | 'country'
      | 'minExperience'
      | 'maxExperience'
      | 'minSalary'
      | 'maxSalary'
      | 'salaryCurrency'
      | 'applicationDeadline'
      | 'eligibilityTitle'
      | 'interviewProcess'
    >
  > {
  slug: string;
  companyLogo: string | null;
  companyWebsite: string | null;
  companyDescription: string | null;
  description: string | null;
  shortDescription: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  minExperience: number | null;
  maxExperience: number | null;
  minSalary: number | null;
  maxSalary: number | null;
  salaryCurrency: string;
  applicationDeadline: Date | null;
  eligibilityTitle: string | null;
  interviewProcess: InterviewProcessStep[];
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
