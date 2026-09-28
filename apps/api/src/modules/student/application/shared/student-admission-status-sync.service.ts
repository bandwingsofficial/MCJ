import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import type { EnrollmentRepository } from '@modules/enrollment/domain/repositories/enrollment.repository';
import { Enrollment } from '@modules/enrollment/domain/entities/enrollment.entity';
import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import { EnrollmentDomainService } from '@modules/enrollment/domain/services/enrollment-domain.service';
import { EnrollmentSideEffectsService } from '@modules/enrollment/application/shared/enrollment-side-effects.service';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

import type { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentStatus } from '../../domain/enums/student-status.enum';

const ADMISSION_SYNC_STUDENT_STATUSES = new Set<StudentStatus>([
  StudentStatus.LEAD,
  StudentStatus.ADVANCED,
  StudentStatus.ADMITTED,
]);

export class StudentAdmissionStatusSyncService {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly enrollmentDomainService: EnrollmentDomainService,
    private readonly enrollmentSideEffects: EnrollmentSideEffectsService,
  ) {}

  isAdmissionSyncStatus(status: StudentStatus): boolean {
    return ADMISSION_SYNC_STUDENT_STATUSES.has(status);
  }

  async applyStudentAdmissionStatus(params: {
    student: Student;
    targetStatus: StudentStatus;
    updatedBy?: string | null;
    actorBranchId?: string;
  }): Promise<Student> {
    const { student, targetStatus, updatedBy, actorBranchId } = params;

    if (!this.isAdmissionSyncStatus(targetStatus)) {
      return student;
    }

    const currentEnrollment =
      await this.enrollmentRepo.findCurrentByStudentId(student.id);

    if (student.status === targetStatus) {
      if (targetStatus === StudentStatus.LEAD) {
        if (
          !currentEnrollment ||
          !Enrollment.isCurrentStatus(currentEnrollment.status)
        ) {
          return student;
        }
      } else {
        const expected =
          this.enrollmentDomainService.resolveEnrollmentStatusForStudentAdmissionStatus(
            targetStatus,
          );
        if (expected && currentEnrollment?.status === expected) {
          return student;
        }
      }
    }

    if (targetStatus === StudentStatus.LEAD) {
      if (!currentEnrollment) {
        student.update({ status: StudentStatus.LEAD, updatedBy });
        await this.studentRepo.save(student);
        return student;
      }

      await this.transitionCurrentEnrollment(
        currentEnrollment,
        EnrollmentStatus.CANCELLED,
        updatedBy,
        actorBranchId,
      );
      return (await this.studentRepo.findById(student.id)) ?? student;
    }

    const targetEnrollmentStatus =
      this.enrollmentDomainService.resolveEnrollmentStatusForStudentAdmissionStatus(
        targetStatus,
      );

    if (!targetEnrollmentStatus) {
      student.update({ status: targetStatus, updatedBy });
      await this.studentRepo.save(student);
      return student;
    }

    if (!currentEnrollment) {
      throw new BaseException(
        ERROR_CODES.ENROLLMENT_NOT_FOUND,
        'No current enrollment found for this student.',
        404,
      );
    }

    this.enrollmentDomainService.ensureBranchAccess(
      currentEnrollment,
      actorBranchId,
    );

    await this.transitionCurrentEnrollment(
      currentEnrollment,
      targetEnrollmentStatus,
      updatedBy,
      actorBranchId,
    );

    return (await this.studentRepo.findById(student.id)) ?? student;
  }

  private async transitionCurrentEnrollment(
    enrollment: Awaited<
      ReturnType<EnrollmentRepository['findCurrentByStudentId']>
    >,
    targetStatus: EnrollmentStatus,
    updatedBy?: string | null,
    actorBranchId?: string,
  ): Promise<void> {
    if (!enrollment) {
      return;
    }

    this.enrollmentDomainService.ensureMutable(enrollment);

    const previousStatus = enrollment.status;

    if (previousStatus === targetStatus) {
      return;
    }

    this.enrollmentDomainService.ensureValidStatusTransition(
      previousStatus,
      targetStatus,
    );

    if (targetStatus === EnrollmentStatus.ADMITTED) {
      enrollment.update({
        status: EnrollmentStatus.ADMITTED,
        admissionDate: enrollment.admissionDate ?? new Date(),
        isActive: true,
        updatedBy,
      });
    } else if (targetStatus === EnrollmentStatus.CANCELLED) {
      enrollment.changeStatus(EnrollmentStatus.CANCELLED, updatedBy);
      enrollment.deactivate(updatedBy);
    } else {
      enrollment.changeStatus(targetStatus, updatedBy);
    }

    if (targetStatus === EnrollmentStatus.ADMITTED) {
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
}
