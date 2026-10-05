import {
  canTransitionStudentEnrollmentWorkflowStatus,
  normalizeStudentEnrollmentWorkflowStatus,
  studentWorkflowSyncsEnrollmentRow,
  type StudentEnrollmentWorkflowStatus,
} from '@mcj/shared-constants';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import { Enrollment } from '@modules/enrollment/domain/entities/enrollment.entity';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import { EnrollmentDomainService } from '@modules/enrollment/domain/services/enrollment-domain.service';
import { EnrollmentSideEffectsService } from '@modules/enrollment/application/shared/enrollment-side-effects.service';
import { InvalidStatusTransitionException } from '@modules/enrollment/domain/errors/enrollment-business.exception';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

import type { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentStatus } from '../../domain/enums/student-status.enum';

const WORKFLOW_STATUSES = new Set<StudentStatus>([
  StudentStatus.LEAD,
  StudentStatus.ADVANCED,
  StudentStatus.ADMITTED,
  StudentStatus.COMPLETED,
  StudentStatus.CANCELLED,
  StudentStatus.PLACED,
]);

export class StudentAdmissionStatusSyncService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly enrollmentDomainService: EnrollmentDomainService,
    private readonly enrollmentSideEffects: EnrollmentSideEffectsService,
  ) {}

  isAdmissionSyncStatus(status: StudentStatus): boolean {
    return WORKFLOW_STATUSES.has(status);
  }

  ensureValidWorkflowTransition(
    from: StudentStatus,
    to: StudentStatus,
  ): void {
    const fromWorkflow = this.toWorkflowStatus(from);
    const toWorkflow = this.toWorkflowStatus(to);

    if (
      !canTransitionStudentEnrollmentWorkflowStatus(fromWorkflow, toWorkflow)
    ) {
      throw new InvalidStatusTransitionException(fromWorkflow, toWorkflow);
    }
  }

  async applyStudentAdmissionStatus(params: {
    student: Student;
    targetStatus: StudentStatus;
    updatedBy?: string | null;
    actorBranchId?: string;
  }): Promise<Student> {
    const { targetStatus, updatedBy, actorBranchId } = params;

    const student =
      (await this.studentRepo.findById(params.student.id)) ?? params.student;

    if (!this.isAdmissionSyncStatus(targetStatus)) {
      return student;
    }

    if (student.status === targetStatus) {
      return student;
    }

    this.ensureValidWorkflowTransition(student.status, targetStatus);

    const toWorkflow = this.toWorkflowStatus(targetStatus);

    const primaryEnrollment = await this.resolvePrimaryEnrollmentForStudent(
      student.id,
    );

    if (!primaryEnrollment && studentWorkflowSyncsEnrollmentRow(toWorkflow)) {
      throw new BaseException(
        ERROR_CODES.ENROLLMENT_NOT_FOUND,
        'No enrollment found for this student.',
        404,
      );
    }

    if (primaryEnrollment && studentWorkflowSyncsEnrollmentRow(toWorkflow)) {
      this.enrollmentDomainService.ensureBranchAccess(
        primaryEnrollment,
        actorBranchId,
      );

      await this.applyEnrollmentWorkflowTarget(
        primaryEnrollment,
        toWorkflow,
        updatedBy,
        actorBranchId,
      );
    }

    student.update({ status: targetStatus, updatedBy });
    await this.studentRepo.save(student);

    notifyDomainMutation({
      domain: 'student',
      action: 'status_changed',
      entityId: student.id,
      branchId: student.branchId ?? undefined,
    });

    return (await this.studentRepo.findById(student.id)) ?? student;
  }

  async applyEnrollmentWorkflowTarget(
    enrollment: Enrollment,
    targetWorkflow: StudentEnrollmentWorkflowStatus,
    updatedBy?: string | null,
    actorBranchId?: string,
  ): Promise<void> {
    this.enrollmentDomainService.ensureBranchAccess(
      enrollment,
      actorBranchId,
    );

    const targetEnrollmentStatus =
      this.enrollmentDomainService.resolveEnrollmentStatusForWorkflowTarget(
        targetWorkflow,
      );

    const previousStatus = enrollment.status;

    if (previousStatus === targetEnrollmentStatus) {
      return;
    }

    if (targetEnrollmentStatus === EnrollmentStatus.ADMITTED) {
      enrollment.update({
        status: EnrollmentStatus.ADMITTED,
        admissionDate: enrollment.admissionDate ?? new Date(),
        isActive: true,
        updatedBy,
      });
    } else {
      enrollment.changeStatus(targetEnrollmentStatus, updatedBy);

      if (
        targetEnrollmentStatus === EnrollmentStatus.COMPLETED ||
        targetEnrollmentStatus === EnrollmentStatus.CANCELLED
      ) {
        enrollment.deactivate(updatedBy);
      } else {
        enrollment.update({ isActive: true, updatedBy });
      }
    }

    if (
      targetEnrollmentStatus === EnrollmentStatus.ADMITTED &&
      !Enrollment.statusOccupiesSeat(previousStatus)
    ) {
      await this.enrollmentSideEffects.assertCapacityForTransition(
        enrollment,
        previousStatus,
      );
    }

    await this.enrollmentRepo.save(enrollment);

    await this.enrollmentSideEffects.apply(
      enrollment,
      previousStatus,
      updatedBy,
      { skipStudentStatusSync: true },
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

  async syncStudentToWorkflowStatus(params: {
    studentId: string;
    targetStatus: StudentStatus;
    updatedBy?: string | null;
  }): Promise<void> {
    const student = await this.studentRepo.findById(params.studentId);
    if (!student || student.status === params.targetStatus) {
      return;
    }

    student.update({
      status: params.targetStatus,
      updatedBy: params.updatedBy,
    });
    await this.studentRepo.save(student);

    notifyDomainMutation({
      domain: 'student',
      action: 'status_changed',
      entityId: student.id,
      branchId: student.branchId ?? undefined,
    });
  }

  async resolvePrimaryEnrollmentForStudent(
    studentId: string,
  ): Promise<Enrollment | null> {
    return this.enrollmentRepo.findPrimaryByStudentId(studentId);
  }

  toWorkflowStatus(status: StudentStatus | string): StudentEnrollmentWorkflowStatus {
    const normalized = normalizeStudentEnrollmentWorkflowStatus(status);
    if (normalized) {
      return normalized;
    }

    return 'LEAD';
  }

  resolveWorkflowStatusFromEnrollment(
    enrollmentStatus: EnrollmentStatus,
  ): StudentEnrollmentWorkflowStatus {
    return this.enrollmentDomainService.resolveWorkflowStatusFromEnrollmentStatus(
      enrollmentStatus,
    );
  }
}

