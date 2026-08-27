import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { Job } from '../entities/job.entity';
import { JobStatus } from '../enums/job-status.enum';
import {
  JobClosedException,
  JobDeletedException,
  JobExpiredException,
  JobInactiveException,
  JobNotDeletedException,
  JobNotFoundException,
  JobNotPendingApprovalException,
} from '../errors/job-business.exception';
import type { JobRepository } from '../repositories/job.repository';
import { Slug } from '../value-objects/slug.vo';

@Injectable()
export class JobDomainService {
  ensureExists(job: Job | null): Job {
    if (!job) {
      throw new JobNotFoundException();
    }

    return job;
  }

  ensureNotDeleted(job: Job): void {
    if (job.isDeleted) {
      throw new JobDeletedException();
    }
  }

  ensureDeleted(job: Job): void {
    if (!job.isDeleted) {
      throw new JobNotDeletedException();
    }
  }

  ensurePubliclyVisible(job: Job): void {
    this.ensureNotDeleted(job);

    if (!job.isActive) {
      throw new JobInactiveException();
    }

    if (job.status === JobStatus.CLOSED) {
      throw new JobClosedException();
    }

    if (job.status === JobStatus.EXPIRED) {
      throw new JobExpiredException();
    }

    if (job.status !== JobStatus.ACTIVE) {
      throw new BaseException(
        ERROR_CODES.JOB_INACTIVE,
        'Job is not available for applications.',
        400,
      );
    }
  }

  ensureAcceptingApplications(job: Job): void {
    this.ensurePubliclyVisible(job);

    if (job.isExpired()) {
      throw new JobExpiredException();
    }
  }

  ensurePendingApproval(job: Job): void {
    if (job.status !== JobStatus.PENDING_APPROVAL) {
      throw new JobNotPendingApprovalException();
    }
  }

  async resolveAvailableSlug(
    jobRepo: JobRepository,
    title: string,
    excludeId?: string,
  ): Promise<string> {
    const base = Slug.fromTitle(title).getValue();
    let slug = base;
    let suffix = 2;

    while (await jobRepo.existsBySlug(slug, excludeId)) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  async ensureSlugIsAvailable(
    jobRepo: JobRepository,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const exists = await jobRepo.existsBySlug(slug, excludeId);

    if (exists) {
      throw new BaseException(
        ERROR_CODES.JOB_ALREADY_EXISTS,
        'Job slug already exists.',
        409,
      );
    }
  }
}
