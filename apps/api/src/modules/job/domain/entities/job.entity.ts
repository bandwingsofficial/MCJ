import { EmploymentType } from '../enums/employment-type.enum';
import { JobSource } from '../enums/job-source.enum';
import { JobStatus } from '../enums/job-status.enum';
import { JobWorkMode } from '../enums/job-work-mode.enum';
import { WorkingDays } from '../enums/working-days.enum';
import { CompanyName } from '../value-objects/company-name.vo';
import { ExperienceRange } from '../value-objects/experience-range.vo';
import { JobTitle } from '../value-objects/job-title.vo';
import { Location } from '../value-objects/location.vo';
import { SalaryRange } from '../value-objects/salary-range.vo';
import { Slug } from '../value-objects/slug.vo';
import { isJobExpiredByDeadline } from '../utils/job-expiry.util';

export interface InterviewProcessStep {
  title: string;
  description: string;
}

function workModeFromRemote(
  workMode?: JobWorkMode | null,
  isRemote?: boolean,
): JobWorkMode {
  if (workMode) {
    return workMode;
  }

  return isRemote ? JobWorkMode.REMOTE : JobWorkMode.ONSITE;
}

export class Job {
  private constructor(
    public readonly id: string,
    public title: JobTitle,
    public slug: Slug,
    public jobNumber: string | null,
    public source: JobSource,
    public companyName: CompanyName,
    public companyLogo: string | null,
    public companyWebsite: string | null,
    public companyEmail: string | null,
    public companyPhone: string | null,
    public companyDescription: string | null,
    public description: string | null,
    public shortDescription: string | null,
    public location: Location,
    public isRemote: boolean,
    public workMode: JobWorkMode,
    public employmentType: EmploymentType,
    public workingDays: WorkingDays,
    public category: string | null,
    public department: string | null,
    public experience: ExperienceRange,
    public salary: SalaryRange,
    public vacancies: number,
    public applicationDeadline: Date | null,
    public responsibilities: string[],
    public skills: string[],
    public preferredSkills: string[],
    public qualifications: string[],
    public benefits: string | null,
    public eligibilityTitle: string | null,
    public interviewProcess: InterviewProcessStep[],
    public status: JobStatus,
    public isActive: boolean,
    public rejectionReason: string | null,
    public reviewedAt: Date | null,
    public reviewedBy: string | null,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: JobCreateParams): Job {
    const workMode = workModeFromRemote(params.workMode, params.isRemote);

    return new Job(
      params.id,
      JobTitle.create(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      params.jobNumber ?? null,
      params.source ?? JobSource.ADMIN,
      CompanyName.create(params.companyName),
      params.companyLogo ?? null,
      params.companyWebsite ?? null,
      params.companyEmail ?? null,
      params.companyPhone ?? null,
      params.companyDescription ?? null,
      params.description ?? null,
      params.shortDescription ?? null,
      Location.create(params),
      workMode === JobWorkMode.REMOTE,
      workMode,
      params.employmentType,
      params.workingDays,
      params.category ?? null,
      params.department ?? null,
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
      params.preferredSkills ?? [],
      params.qualifications ?? [],
      params.benefits ?? null,
      params.eligibilityTitle ?? null,
      params.interviewProcess ?? [],
      params.status ?? JobStatus.DRAFT,
      params.isActive ?? true,
      params.rejectionReason ?? null,
      params.reviewedAt ?? null,
      params.reviewedBy ?? null,
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
      params.jobNumber,
      params.source,
      CompanyName.create(params.companyName),
      params.companyLogo,
      params.companyWebsite,
      params.companyEmail,
      params.companyPhone,
      params.companyDescription,
      params.description,
      params.shortDescription,
      Location.create(params),
      params.isRemote,
      params.workMode,
      params.employmentType,
      params.workingDays,
      params.category,
      params.department,
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
      params.preferredSkills,
      params.qualifications,
      params.benefits,
      params.eligibilityTitle,
      params.interviewProcess,
      params.status,
      params.isActive,
      params.rejectionReason,
      params.reviewedAt,
      params.reviewedBy,
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
    if (params.companyEmail !== undefined) {
      this.companyEmail = params.companyEmail;
    }
    if (params.companyPhone !== undefined) {
      this.companyPhone = params.companyPhone;
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
    if (params.workMode !== undefined) {
      this.workMode = params.workMode;
      this.isRemote = params.workMode === JobWorkMode.REMOTE;
    } else if (params.isRemote !== undefined) {
      this.isRemote = params.isRemote;
      this.workMode = params.isRemote
        ? JobWorkMode.REMOTE
        : JobWorkMode.ONSITE;
    }
    if (params.employmentType !== undefined) {
      this.employmentType = params.employmentType;
    }
    if (params.workingDays !== undefined) {
      this.workingDays = params.workingDays;
    }
    if (params.category !== undefined) this.category = params.category;
    if (params.department !== undefined) this.department = params.department;
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
    if (params.preferredSkills !== undefined) {
      this.preferredSkills = params.preferredSkills;
    }
    if (params.qualifications !== undefined) {
      this.qualifications = params.qualifications;
    }
    if (params.benefits !== undefined) this.benefits = params.benefits;
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

  approve(jobNumber: string, reviewedBy?: string | null) {
    this.jobNumber = jobNumber;
    this.status = JobStatus.ACTIVE;
    this.isActive = true;
    this.rejectionReason = null;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewedBy ?? null;
    this.updatedBy = reviewedBy ?? this.updatedBy;
    this.touch();
  }

  reject(reason: string | null, reviewedBy?: string | null) {
    this.status = JobStatus.REJECTED;
    this.isActive = false;
    this.rejectionReason = reason;
    this.reviewedAt = new Date();
    this.reviewedBy = reviewedBy ?? null;
    this.updatedBy = reviewedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    if (this.status === JobStatus.DRAFT) {
      this.status = JobStatus.ACTIVE;
    }
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

  isExpired(): boolean {
    return isJobExpiredByDeadline(this.applicationDeadline);
  }

  isPubliclyVisible(): boolean {
    return (
      !this.isDeleted &&
      this.isActive &&
      this.status === JobStatus.ACTIVE &&
      !this.isExpired()
    );
  }

  isAcceptingApplications(): boolean {
    return this.isPubliclyVisible();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface JobCreateParams {
  id: string;
  title: string;
  slug?: string;
  jobNumber?: string | null;
  source?: JobSource;
  companyName: string;
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
  employmentType: EmploymentType;
  workingDays: WorkingDays;
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
  isActive?: boolean;
  rejectionReason?: string | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  createdBy?: string | null;
}

export interface JobUpdateParams
  extends Partial<Omit<JobCreateParams, 'id' | 'createdBy' | 'source'>> {
  updatedBy?: string | null;
}

export interface JobReconstituteParams {
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
  isRemote: boolean;
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
  applicationDeadline: Date | null;
  responsibilities: string[];
  skills: string[];
  preferredSkills: string[];
  qualifications: string[];
  benefits: string | null;
  eligibilityTitle: string | null;
  interviewProcess: InterviewProcessStep[];
  status: JobStatus;
  isActive: boolean;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
