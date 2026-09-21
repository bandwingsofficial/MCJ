import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationStatus } from '../enums/job-application-status.enum';
import {
  InvalidApplicationStatusTransitionException,
  JobApplicationDeletedException,
  JobApplicationNotDeletedException,
  JobApplicationNotFoundException,
} from '../errors/job-application-business.exception';
import type {
  JobApplicationDetailView,
  JobApplicationRepository,
} from '../repositories/job-application.repository';

@Injectable()
export class JobApplicationDomainService {
  ensureExists(
    application: JobApplication | null,
  ): JobApplication {
    if (!application) {
      throw new JobApplicationNotFoundException();
    }

    return application;
  }

  ensureDetailExists(
    application: JobApplicationDetailView | null,
  ): JobApplicationDetailView {
    if (!application) {
      throw new JobApplicationNotFoundException();
    }

    return application;
  }

  ensureNotDeleted(application: JobApplication): void {
    if (application.isDeleted) {
      throw new JobApplicationDeletedException();
    }
  }

  ensureDeleted(application: JobApplication): void {
    if (!application.isDeleted) {
      throw new JobApplicationNotDeletedException();
    }
  }

  async ensureNotDuplicate(
    repo: JobApplicationRepository,
    jobId: string,
    studentId: string,
  ): Promise<void> {
    const existing = await repo.findBlockingByJobAndStudent(
      jobId,
      studentId,
    );

    if (existing) {
      throw new BaseException(
        ERROR_CODES.JOB_ALREADY_APPLIED,
        'You have already applied to this job.',
        409,
      );
    }
  }

  async ensureNotDuplicateEmail(
    repo: JobApplicationRepository,
    jobId: string,
    email: string,
  ): Promise<void> {
    const existing = await repo.findBlockingByJobAndEmail(
      jobId,
      email,
    );

    if (existing) {
      throw new BaseException(
        ERROR_CODES.JOB_ALREADY_APPLIED,
        'An application with this email already exists for this job.',
        409,
      );
    }
  }

  ensureRejectionReason(
    status: JobApplicationStatus,
    rejectionReason?: string | null,
  ): string | null {
    if (status !== JobApplicationStatus.REJECTED) {
      return null;
    }

    const reason = rejectionReason?.trim() ?? '';

    if (!reason) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Rejection reason is required.',
        400,
      );
    }

    return reason;
  }

  ensureValidStatusTransition(
    from: JobApplicationStatus,
    to: JobApplicationStatus,
  ): void {
    if (from === to) {
      return;
    }

    const firstStageTargets: JobApplicationStatus[] = [
      JobApplicationStatus.SHORTLISTED,
      JobApplicationStatus.INTERVIEW,
      JobApplicationStatus.SELECTED,
      JobApplicationStatus.REJECTED,
    ];

    const allowedTransitions: Record<
      JobApplicationStatus,
      JobApplicationStatus[]
    > = {
      [JobApplicationStatus.APPLIED]: firstStageTargets,
      [JobApplicationStatus.UNDER_REVIEW]: firstStageTargets,
      [JobApplicationStatus.SHORTLISTED]: [
        JobApplicationStatus.ASSESSMENT,
        JobApplicationStatus.INTERVIEW,
        JobApplicationStatus.REJECTED,
      ],
      [JobApplicationStatus.ASSESSMENT]: [
        JobApplicationStatus.INTERVIEW,
        JobApplicationStatus.REJECTED,
      ],
      [JobApplicationStatus.INTERVIEW]: [
        JobApplicationStatus.SELECTED,
        JobApplicationStatus.REJECTED,
      ],
      [JobApplicationStatus.SELECTED]: [
        JobApplicationStatus.PLACED,
        JobApplicationStatus.REJECTED,
      ],
      [JobApplicationStatus.PLACED]: [],
      [JobApplicationStatus.REJECTED]: [
        JobApplicationStatus.SHORTLISTED,
        JobApplicationStatus.SELECTED,
      ],
    };

    if (!allowedTransitions[from].includes(to)) {
      throw new InvalidApplicationStatusTransitionException(
        from,
        to,
      );
    }
  }
}
