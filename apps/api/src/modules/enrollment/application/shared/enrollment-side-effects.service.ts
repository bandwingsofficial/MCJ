import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { RestoreBatchFullException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';

// Synchronizes batch seat counts and student status with enrollment status changes.
export class EnrollmentSideEffectsService {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: EnrollmentDomainService,
  ) {}

  async apply(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
    actorId?: string | null,
  ): Promise<void> {
    await this.syncBatchSeatCount(
      enrollment,
      previousStatus,
      actorId,
    );
    await this.syncStudentStatus(enrollment, actorId);
  }

  // Rejects a status transition that would over-fill the batch, before any
  // state is persisted (there are no cross-aggregate transactions here).
  async assertCapacityForTransition(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
    options?: { restore?: boolean },
  ): Promise<void> {
    const wasOccupying = previousStatus
      ? Enrollment.statusOccupiesSeat(previousStatus)
      : false;

    if (!enrollment.occupiesSeat() || wasOccupying) {
      return;
    }

    const batch = await this.batchRepo.findById(
      enrollment.batchId,
    );
    if (!batch) {
      return;
    }

    try {
      this.domainService.ensureBatchHasCapacity(batch);
    } catch (error) {
      if (options?.restore) {
        throw new RestoreBatchFullException();
      }

      throw error;
    }
  }

  private async syncBatchSeatCount(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
    actorId?: string | null,
  ): Promise<void> {
    const wasOccupying = previousStatus
      ? Enrollment.statusOccupiesSeat(previousStatus)
      : false;
    const isOccupying = enrollment.occupiesSeat();

    if (wasOccupying === isOccupying) {
      return;
    }

    const batch = await this.batchRepo.findById(
      enrollment.batchId,
    );
    if (!batch) {
      return;
    }

    if (isOccupying) {
      this.domainService.ensureBatchHasCapacity(batch);
      batch.update({
        enrolledCount: batch.enrolledCount + 1,
        updatedBy: actorId,
      });
    } else {
      batch.update({
        enrolledCount: Math.max(0, batch.enrolledCount - 1),
        updatedBy: actorId,
      });
    }

    await this.batchRepo.save(batch);
  }

  private async syncStudentStatus(
    enrollment: Enrollment,
    actorId?: string | null,
  ): Promise<void> {
    const studentStatus = this.domainService.resolveStudentStatus(
      enrollment.status,
    );

    if (!studentStatus) {
      return;
    }

    const student = await this.studentRepo.findById(
      enrollment.studentId,
    );
    if (!student || student.status === studentStatus) {
      return;
    }

    student.update({
      status: studentStatus,
      updatedBy: actorId,
    });

    await this.studentRepo.save(student);
  }

  // Releases a batch seat when an occupying enrollment is removed.
  async releaseSeat(
    enrollment: Enrollment,
    actorId?: string | null,
  ): Promise<void> {
    if (!enrollment.occupiesSeat()) {
      return;
    }

    const batch = await this.batchRepo.findById(
      enrollment.batchId,
    );
    if (!batch) {
      return;
    }

    batch.update({
      enrolledCount: Math.max(0, batch.enrolledCount - 1),
      updatedBy: actorId,
    });

    await this.batchRepo.save(batch);
  }
}
