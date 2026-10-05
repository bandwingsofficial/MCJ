import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';

import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';

import { StudentAdmissionStatusSyncService } from '@modules/student/application/shared/student-admission-status-sync.service';



import { Enrollment } from '../../domain/entities/enrollment.entity';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

import { EnrollmentAlreadyUnenrolledException } from '../../domain/errors/enrollment-already-unenrolled.exception';

import { InvalidStatusTransitionException } from '../../domain/errors/enrollment-business.exception';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';

import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';

import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

import { EnrollmentCoinService } from '../shared/enrollment-coin.service';

import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';



import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';



import { UnenrollEnrollmentCommand } from './unenroll-enrollment.command';



export class UnenrollEnrollmentHandler {

  constructor(

    private readonly enrollmentRepo: EnrollmentRepository,

    private readonly studentRepo: StudentRepository,

    private readonly batchRepo: BatchRepository,

    private readonly domainService: EnrollmentDomainService,

    private readonly sideEffects: EnrollmentSideEffectsService,

    private readonly coinService: EnrollmentCoinService,

    private readonly workflowSync: StudentAdmissionStatusSyncService,

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



    if (enrollment.status === EnrollmentStatus.COMPLETED) {

      throw new InvalidStatusTransitionException(

        enrollment.status,

        EnrollmentStatus.CANCELLED,

      );

    }



    if (!enrollment.isActive) {

      throw new EnrollmentAlreadyUnenrolledException();

    }



    if (!Enrollment.isCurrentStatus(enrollment.status)) {

      throw new InvalidStatusTransitionException(

        enrollment.status,

        EnrollmentStatus.CANCELLED,

      );

    }



    const previousStatus = enrollment.status;



    const reason = command.reason?.trim();

    const remarks =

      reason !== undefined && reason.length > 0

        ? enrollment.remarks

          ? `${enrollment.remarks}\nUnenroll: ${reason}`

          : reason

        : undefined;



    await this.workflowSync.applyEnrollmentWorkflowTarget(

      enrollment,

      'CANCELLED',

      command.updatedBy,

      command.actorBranchId ?? undefined,

    );



    enrollment.update({

      isActive: false,

      ...(remarks !== undefined ? { remarks } : {}),

      updatedBy: command.updatedBy,

    });

    await this.enrollmentRepo.save(enrollment);



    if (enrollment.redeemedCoins > 0) {

      await this.coinService.releaseCoinsForEnrollment(enrollment);

    }



    await this.sideEffects.apply(

      enrollment,

      previousStatus,

      command.updatedBy,

      { skipStudentStatusSync: true },

    );



    await this.workflowSync.syncStudentToWorkflowStatus({

      studentId: enrollment.studentId,

      targetStatus: StudentStatus.LEAD,

      updatedBy: command.updatedBy,

    });



    notifyDomainMutation({

      domain: 'enrollment',

      action: 'status_changed',

      entityId: enrollment.id,

      batchId: enrollment.batchId,

      studentId: enrollment.studentId,

      courseId: enrollment.courseId,

      branchId: enrollment.branchId,

    });



    return this.domainService.ensureDetailExists(

      await this.enrollmentRepo.findDetailById(enrollment.id, true),

    );

  }

}


