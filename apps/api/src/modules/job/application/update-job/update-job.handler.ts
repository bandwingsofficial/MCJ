import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';
import { GetJobResult } from '../get-job/get-job.result';
import { UpdateJobCommand } from './update-job.command';

export class UpdateJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: UpdateJobCommand): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(job);

    if (command.slug) {
      await this.domainService.ensureSlugIsAvailable(
        this.jobRepo,
        Slug.create(command.slug).getValue(),
        job.id,
      );
    } else if (command.title) {
      const slug = Slug.fromTitle(command.title).getValue();
      await this.domainService.ensureSlugIsAvailable(
        this.jobRepo,
        slug,
        job.id,
      );
    }

    job.update({
      title: command.title,
      slug: command.slug,
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
      updatedBy: command.updatedBy,
    });

    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
