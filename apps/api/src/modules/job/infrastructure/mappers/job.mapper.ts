import { Job as PrismaJob, Prisma } from '@prisma/client';

import {
  InterviewProcessStep,
  Job,
} from '../../domain/entities/job.entity';
import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';

export class JobMapper {
  static toDomain(record: PrismaJob): Job {
    return Job.reconstitute({
      id: record.id,
      title: record.title,
      slug: record.slug,
      companyName: record.companyName,
      companyLogo: record.companyLogo,
      companyWebsite: record.companyWebsite,
      companyDescription: record.companyDescription,
      description: record.description,
      shortDescription: record.shortDescription,
      location: record.location,
      city: record.city,
      state: record.state,
      country: record.country,
      isRemote: record.isRemote,
      employmentType: record.employmentType as EmploymentType,
      workingDays: record.workingDays as WorkingDays,
      minExperience: record.minExperience,
      maxExperience: record.maxExperience,
      minSalary: record.minSalary ? Number(record.minSalary) : null,
      maxSalary: record.maxSalary ? Number(record.maxSalary) : null,
      salaryCurrency: record.salaryCurrency,
      vacancies: record.vacancies,
      applicationDeadline: record.applicationDeadline,
      responsibilities: record.responsibilities,
      skills: record.skills,
      eligibilityTitle: record.eligibilityTitle,
      interviewProcess: JobMapper.parseInterviewProcess(
        record.interviewProcess,
      ),
      status: record.status as JobStatus,
      isActive: record.isActive,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(job: Job): Prisma.JobUncheckedCreateInput {
    return {
      id: job.id,
      title: job.title.getValue(),
      slug: job.slug.getValue(),
      companyName: job.companyName.getValue(),
      companyLogo: job.companyLogo,
      companyWebsite: job.companyWebsite,
      companyDescription: job.companyDescription,
      description: job.description,
      shortDescription: job.shortDescription,
      location: job.location.getLocation(),
      city: job.location.getCity(),
      state: job.location.getState(),
      country: job.location.getCountry(),
      isRemote: job.isRemote,
      employmentType: job.employmentType,
      workingDays: job.workingDays,
      minExperience: job.experience.getMin(),
      maxExperience: job.experience.getMax(),
      minSalary: job.salary.getMin(),
      maxSalary: job.salary.getMax(),
      salaryCurrency: job.salary.getCurrency(),
      vacancies: job.vacancies,
      applicationDeadline: job.applicationDeadline,
      responsibilities: job.responsibilities,
      skills: job.skills,
      eligibilityTitle: job.eligibilityTitle,
      interviewProcess: job.interviewProcess as unknown as Prisma.InputJsonValue,
      status: job.status,
      isActive: job.isActive,
      createdBy: job.createdBy,
      updatedBy: job.updatedBy,
      isDeleted: job.isDeleted,
      deletedAt: job.deletedAt,
      deletedBy: job.deletedBy,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private static parseInterviewProcess(
    value: Prisma.JsonValue | null,
  ): InterviewProcessStep[] {
    if (!value || !Array.isArray(value)) {
      return [];
    }

    return value as unknown as InterviewProcessStep[];
  }
}
