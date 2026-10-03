import {
  canTransitionEnrollmentRecordStatus,
  normalizeEnrollmentRecordLifecycleStatus,
  type EnrollmentRecordWorkflowStatus,
} from '@mcj/shared-constants';

import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { StudentDomainService } from '@modules/student/domain/services/student-domain.service';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import { StudentAdmissionStatusSyncService } from '@modules/student/application/shared/student-admission-status-sync.service';

import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { InvalidStatusTransitionException } from '../../domain/errors/enrollment-business.exception';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

import { UpdateEnrollmentStatusCommand } from './update-enrollment-status.command';

const ADMIN_ENROLLMENT_STATUSES = new Set<EnrollmentStatus>([
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.COMPLETED,
]);

export class UpdateEnrollmentStatusHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly workflowSync: StudentAdmissionStatusSyncService,
    private readonly studentDomainService: StudentDomainService,
  ) {}

  async execute(
    command: UpdateEnrollmentStatusCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);

    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    if (ADMIN_ENROLLMENT_STATUSES.has(command.status)) {
      return this.executeWorkflowTransition(enrollment, command);
    }

    this.domainService.ensureMutable(enrollment);

    const previousStatus = enrollment.status;

    this.domainService.ensureValidStatusTransition(
      previousStatus,
      command.status,
    );

    if (command.status === EnrollmentStatus.ADMITTED) {
      enrollment.update({
        status: EnrollmentStatus.ADMITTED,
        admissionDate: enrollment.admissionDate ?? new Date(),
        isActive: true,
        updatedBy: command.updatedBy,
      });
    } else {
      enrollment.changeStatus(command.status, command.updatedBy);
    }

    await this.enrollmentRepo.save(enrollment);

    if (command.status !== previousStatus) {
      await this.sideEffects.apply(
        enrollment,
        previousStatus,
        command.updatedBy,
      );

      notifyDomainMutation({
        domain: 'enrollment',
        action: 'status_changed',
        entityId: enrollment.id,
        batchId: enrollment.batchId,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        branchId: enrollment.branchId,
      });
    }

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }

  private async executeWorkflowTransition(
    enrollment: NonNullable<
      Awaited<ReturnType<EnrollmentRepository['findById']>>
    >,
    command: UpdateEnrollmentStatusCommand,
  ): Promise<GetEnrollmentResult> {
    await this.studentDomainService.ensureExists(
      await this.studentRepo.findById(enrollment.studentId),
    );

    const fromLifecycle = normalizeEnrollmentRecordLifecycleStatus(
      enrollment.status,
    );
    const toLifecycle = normalizeEnrollmentRecordLifecycleStatus(
      command.status,
    );

    if (!fromLifecycle || !toLifecycle) {
      throw new InvalidStatusTransitionException(
        enrollment.status,
        command.status,
      );
    }

    if (
      !canTransitionEnrollmentRecordStatus(fromLifecycle, toLifecycle)
    ) {
      throw new InvalidStatusTransitionException(
        fromLifecycle,
        toLifecycle,
      );
    }

    await this.workflowSync.applyEnrollmentWorkflowTarget(
      enrollment,
      toLifecycle as EnrollmentRecordWorkflowStatus,
      command.updatedBy,
      command.actorBranchId,
    );

    const student = await this.studentRepo.findById(enrollment.studentId);
    if (student) {
      student.update({
        status: toLifecycle as StudentStatus,
        updatedBy: command.updatedBy,
      });
      await this.studentRepo.save(student);

      notifyDomainMutation({
        domain: 'student',
        action: 'status_changed',
        entityId: student.id,
        branchId: student.branchId ?? undefined,
      });
    }

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
