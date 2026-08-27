import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { Job } from '../../domain/entities/job.entity';
import { JobSource } from '../../domain/enums/job-source.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';

import { CreateJobCommand } from './create-job.command';

export class CreateJobHandler {
  private readonly logger = new Logger(CreateJobHandler.name);

  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: CreateJobCommand): Promise<GetJobResult> {
    const input = command.input;
    const source = input.source ?? JobSource.ADMIN;
    const deferJobNumber =
      input.deferJobNumber ?? source === JobSource.COMPANY_ONBOARDING;

    if (input.applicationDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadline = new Date(input.applicationDeadline);
      deadline.setHours(0, 0, 0, 0);

      if (Number.isNaN(deadline.getTime()) || deadline <= today) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Job expiry date must be a future date.',
          400,
        );
      }
    }

    const slug = await this.domainService.resolveAvailableSlug(
      this.jobRepo,
      input.title,
    );

    const jobNumber = deferJobNumber
      ? null
      : await this.jobRepo.nextJobNumber();

    const status = deferJobNumber
      ? JobStatus.PENDING_APPROVAL
      : (input.status ?? JobStatus.ACTIVE);

    const job = Job.create({
      id: randomUUID(),
      title: input.title,
      slug,
      jobNumber,
      source,
      companyName: input.companyName,
      companyLogo: input.companyLogo,
      companyWebsite: input.companyWebsite,
      companyEmail: input.companyEmail,
      companyPhone: input.companyPhone,
      companyDescription: input.companyDescription,
      description: input.description,
      shortDescription: input.shortDescription,
      location: input.location,
      city: input.city,
      state: input.state,
      country: input.country,
      isRemote: input.isRemote,
      workMode: input.workMode,
      employmentType: input.employmentType,
      workingDays: input.workingDays,
      category: input.category,
      department: input.department,
      minExperience: input.minExperience,
      maxExperience: input.maxExperience,
      minSalary: input.minSalary,
      maxSalary: input.maxSalary,
      salaryCurrency: input.salaryCurrency,
      vacancies: input.vacancies,
      applicationDeadline: input.applicationDeadline,
      responsibilities: input.responsibilities,
      skills: input.skills,
      preferredSkills: input.preferredSkills,
      qualifications: input.qualifications,
      benefits: input.benefits,
      eligibilityTitle: input.eligibilityTitle,
      interviewProcess: input.interviewProcess,
      status,
      isActive: deferJobNumber ? false : status === JobStatus.ACTIVE,
      createdBy: input.createdBy,
    });

    await this.jobRepo.save(job);

    this.logger.log(
      deferJobNumber
        ? `Company job submission received: ${job.id}`
        : `Job created: ${job.id} ${job.jobNumber}`,
    );

    return GetJobResult.fromEntity(job);
  }
}
