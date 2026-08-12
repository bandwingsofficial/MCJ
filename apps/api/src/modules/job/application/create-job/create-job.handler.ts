import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { Job } from '../../domain/entities/job.entity';
import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';
import { GetJobResult } from '../get-job/get-job.result';

import { CreateJobCommand } from './create-job.command';

export class CreateJobHandler {
  private readonly logger = new Logger(CreateJobHandler.name);

  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: CreateJobCommand): Promise<GetJobResult> {
    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromTitle(command.title).getValue();

    await this.domainService.ensureSlugIsAvailable(this.jobRepo, slug);

    const job = Job.create({
      id: randomUUID(),
      title: command.title,
      slug,
      companyName: command.companyName,
      companyLogo: command.companyLogo,
      companyWebsite: command.companyWebsite,
      companyDescription: command.companyDescription,
      description: command.description,
      shortDescription: command.shortDescription,
      location: command.location,
      city: command.city,
      state: command.state,
      country: command.country,
      isRemote: command.isRemote,
      employmentType: command.employmentType,
      workingDays: command.workingDays,
      minExperience: command.minExperience,
      maxExperience: command.maxExperience,
      minSalary: command.minSalary,
      maxSalary: command.maxSalary,
      salaryCurrency: command.salaryCurrency,
      vacancies: command.vacancies,
      applicationDeadline: command.applicationDeadline,
      responsibilities: command.responsibilities,
      skills: command.skills,
      eligibilityTitle: command.eligibilityTitle,
      interviewProcess: command.interviewProcess,
      status: command.status,
      createdBy: command.createdBy,
    });

    await this.jobRepo.save(job);

    this.logger.log(`✅ Job created: ${job.id}`);

    return GetJobResult.fromEntity(job);
  }
}
