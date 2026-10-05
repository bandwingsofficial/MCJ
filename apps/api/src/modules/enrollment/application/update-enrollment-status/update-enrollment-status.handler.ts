import {
  adminEnrollmentLifecycleFromWorkflowTarget,
  canTransitionAdminEnrollmentLifecycle,
  canTransitionStudentEnrollmentWorkflowStatus,
  resolveAdminEnrollmentLifecycleForRowActions,
  studentStatusAfterAdminEnrollmentLifecycleChange,
  type StudentEnrollmentWorkflowStatus,
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

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

import { UpdateEnrollmentStatusCommand } from './update-enrollment-status.command';

const ADMIN_ENROLLMENT_TARGETS = new Set<EnrollmentStatus>([
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.COMPLETED,
  EnrollmentStatus.CANCELLED,
]);

export class UpdateEnrollmentStatusHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: EnrollmentDomainService,
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

    if (command.status === EnrollmentStatus.PLACED) {
      return this.executeStudentPlacedFromCompleted(enrollment, command);
    }

    if (ADMIN_ENROLLMENT_TARGETS.has(command.status)) {
      return this.executeAdminEnrollmentLifecycleTransition(
        enrollment,
        command,
      );
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

  private async executeStudentPlacedFromCompleted(
    enrollment: NonNullable<
      Awaited<ReturnType<EnrollmentRepository['findById']>>
    >,
    command: UpdateEnrollmentStatusCommand,
  ): Promise<GetEnrollmentResult> {
    const freshEnrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(enrollment.id, true),
    );

    if (freshEnrollment.status !== EnrollmentStatus.COMPLETED) {
      throw new InvalidStatusTransitionException(
        freshEnrollment.status,
        EnrollmentStatus.PLACED,
      );
    }

    const student = await this.studentRepo.findById(freshEnrollment.studentId);
    if (!student) {
      throw new InvalidStatusTransitionException(
        freshEnrollment.status,
        EnrollmentStatus.PLACED,
      );
    }

    if (student.status !== StudentStatus.COMPLETED) {
      throw new InvalidStatusTransitionException(
        student.status,
        StudentStatus.PLACED,
        `Cannot mark as Placed: enrollment is Completed but student status is ${student.status}. Student must be Completed (not Lead/Advanced/Admitted from a newer enrollment).`,
      );
    }

    this.workflowSync.ensureValidWorkflowTransition(
      StudentStatus.COMPLETED,
      StudentStatus.PLACED,
    );

    student.update({
      status: StudentStatus.PLACED,
      updatedBy: command.updatedBy,
    });
    await this.studentRepo.save(student);

    notifyDomainMutation({
      domain: 'student',
      action: 'status_changed',
      entityId: student.id,
      branchId: student.branchId ?? undefined,
    });

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(freshEnrollment.id, true),
    );
  }

  private async executeAdminEnrollmentLifecycleTransition(
    enrollment: NonNullable<
      Awaited<ReturnType<EnrollmentRepository['findById']>>
    >,
    command: UpdateEnrollmentStatusCommand,
  ): Promise<GetEnrollmentResult> {
    const freshEnrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(enrollment.id, true),
    );

    await this.studentDomainService.ensureExists(
      await this.studentRepo.findById(freshEnrollment.studentId),
    );

    const student = await this.studentRepo.findById(freshEnrollment.studentId);
    if (!student) {
      throw new InvalidStatusTransitionException(
        freshEnrollment.status,
        command.status,
      );
    }

    const fromLifecycle = resolveAdminEnrollmentLifecycleForRowActions({
      enrollmentStatus: freshEnrollment.status,
      isActive: freshEnrollment.isActive,
    });

    const toLifecycle = adminEnrollmentLifecycleFromWorkflowTarget(
      command.status,
    );

    if (!fromLifecycle || !toLifecycle) {
      throw new InvalidStatusTransitionException(
        freshEnrollment.status,
        command.status,
      );
    }

    if (
      !canTransitionAdminEnrollmentLifecycle(fromLifecycle, toLifecycle)
    ) {
      throw new InvalidStatusTransitionException(fromLifecycle, toLifecycle);
    }

    await this.workflowSync.applyEnrollmentWorkflowTarget(
      freshEnrollment,
      toLifecycle as StudentEnrollmentWorkflowStatus,
      command.updatedBy,
      command.actorBranchId,
    );

    const targetStudentWorkflow =
      studentStatusAfterAdminEnrollmentLifecycleChange(toLifecycle);
    const targetStudentStatus = targetStudentWorkflow as StudentStatus;

    if (student.status !== targetStudentStatus) {
      const skipStudentTransitionCheck =
        toLifecycle === 'CANCELLED' &&
        targetStudentWorkflow === 'LEAD';

      if (
        !skipStudentTransitionCheck &&
        !canTransitionStudentEnrollmentWorkflowStatus(
          this.workflowSync.toWorkflowStatus(student.status),
          targetStudentWorkflow,
        )
      ) {
        throw new InvalidStatusTransitionException(
          student.status,
          targetStudentStatus,
        );
      }

      student.update({
        status: targetStudentStatus,
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
      await this.enrollmentRepo.findDetailById(freshEnrollment.id, true),
    );
  }
}
