import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import {
  BatchNotFoundException,
  EnrollmentBranchAccessDeniedException,
  InvalidStatusTransitionException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentAlreadyUnenrolledException } from '../../domain/errors/enrollment-already-unenrolled.exception';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { UnenrollEnrollmentCommand } from './unenroll-enrollment.command';

export class UnenrollEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: UnenrollEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);
    await this.domainService.ensureEnrollmentBatchBranchAccess(
      enrollment,
      this.batchRepo,
      command.actorBranchId,
    );

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new EnrollmentAlreadyUnenrolledException();
    }

    if (!Enrollment.isCurrentStatus(enrollment.status)) {
      throw new InvalidStatusTransitionException(
        enrollment.status,
        EnrollmentStatus.CANCELLED,
      );
    }

    const previousStatus = enrollment.status;

    this.domainService.ensureValidStatusTransition(
      previousStatus,
      EnrollmentStatus.CANCELLED,
    );

    const reason = command.reason?.trim();
    const remarks =
      reason !== undefined && reason.length > 0
        ? enrollment.remarks
          ? `${enrollment.remarks}\nUnenroll: ${reason}`
          : reason
        : undefined;

    enrollment.update({
      status: EnrollmentStatus.CANCELLED,
      isActive: false,
      ...(remarks !== undefined ? { remarks } : {}),
      updatedBy: command.updatedBy,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.sideEffects.apply(
      enrollment,
      previousStatus,
      command.updatedBy,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
