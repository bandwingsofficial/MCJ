import { Job as PrismaJob, Prisma } from '@prisma/client';

import {
  InterviewProcessStep,
  Job,
} from '../../domain/entities/job.entity';
import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobSource } from '../../domain/enums/job-source.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { JobWorkMode } from '../../domain/enums/job-work-mode.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';

export class JobMapper {
  static toDomain(record: PrismaJob): Job {
    return Job.reconstitute({
      id: record.id,
      title: record.title,
      slug: record.slug,
      jobNumber: record.jobNumber,
      source: record.source as JobSource,
      companyName: record.companyName,
      companyLogo: record.companyLogo,
      companyWebsite: record.companyWebsite,
      companyEmail: record.companyEmail,
      companyPhone: record.companyPhone,
      companyDescription: record.companyDescription,
      description: record.description,
      shortDescription: record.shortDescription,
      location: record.location,
      city: record.city,
      state: record.state,
      country: record.country,
      isRemote: record.isRemote,
      workMode: record.workMode as JobWorkMode,
      employmentType: record.employmentType as EmploymentType,
      workingDays: record.workingDays as WorkingDays,
      category: record.category,
      department: record.department,
      minExperience: record.minExperience,
      maxExperience: record.maxExperience,
      minSalary: record.minSalary ? Number(record.minSalary) : null,
      maxSalary: record.maxSalary ? Number(record.maxSalary) : null,
      salaryCurrency: record.salaryCurrency,
      vacancies: record.vacancies,
      applicationDeadline: record.applicationDeadline,
      responsibilities: record.responsibilities,
      skills: record.skills,
      preferredSkills: record.preferredSkills,
      qualifications: record.qualifications,
      benefits: record.benefits,
      eligibilityTitle: record.eligibilityTitle,
      interviewProcess: JobMapper.parseInterviewProcess(
        record.interviewProcess,
      ),
      status: record.status as JobStatus,
      isActive: record.isActive,
      rejectionReason: record.rejectionReason,
      reviewedAt: record.reviewedAt,
      reviewedBy: record.reviewedBy,
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
      jobNumber: job.jobNumber,
      source: job.source,
      companyName: job.companyName.getValue(),
      companyLogo: job.companyLogo,
      companyWebsite: job.companyWebsite,
      companyEmail: job.companyEmail,
      companyPhone: job.companyPhone,
      companyDescription: job.companyDescription,
      description: job.description,
      shortDescription: job.shortDescription,
      location: job.location.getLocation(),
      city: job.location.getCity(),
      state: job.location.getState(),
      country: job.location.getCountry(),
      isRemote: job.isRemote,
      workMode: job.workMode,
      employmentType: job.employmentType,
      workingDays: job.workingDays,
      category: job.category,
      department: job.department,
      minExperience: job.experience.getMin(),
      maxExperience: job.experience.getMax(),
      minSalary: job.salary.getMin(),
      maxSalary: job.salary.getMax(),
      salaryCurrency: job.salary.getCurrency(),
      vacancies: job.vacancies,
      applicationDeadline: job.applicationDeadline,
      responsibilities: job.responsibilities,
      skills: job.skills,
      preferredSkills: job.preferredSkills,
      qualifications: job.qualifications,
      benefits: job.benefits,
      eligibilityTitle: job.eligibilityTitle,
      interviewProcess: job.interviewProcess as unknown as Prisma.InputJsonValue,
      status: job.status,
      isActive: job.isActive,
      rejectionReason: job.rejectionReason,
      reviewedAt: job.reviewedAt,
      reviewedBy: job.reviewedBy,
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
