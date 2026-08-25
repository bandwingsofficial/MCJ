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

    const student = await this.studentRepo.findById(
      enrollment.studentId,
    );
    if (!student) {
      return;
    }

    const nextBranchId =
      student.branchId === enrollment.branchId
        ? undefined
        : enrollment.branchId;
    const nextStatus =
      studentStatus && student.status !== studentStatus
        ? studentStatus
        : undefined;

    if (!nextBranchId && !nextStatus) {
      return;
    }

    student.update({
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextBranchId ? { branchId: nextBranchId } : {}),
      updatedBy: actorId,
    });

    await this.studentRepo.save(student);
  }

  async transferSeat(
    fromBatchId: string,
    toBatchId: string,
    actorId?: string | null,
  ): Promise<void> {
    if (fromBatchId === toBatchId) {
      return;
    }

    const fromBatch = await this.batchRepo.findById(fromBatchId);
    if (fromBatch) {
      fromBatch.update({
        enrolledCount: Math.max(0, fromBatch.enrolledCount - 1),
        updatedBy: actorId,
      });
      await this.batchRepo.save(fromBatch);
    }

    const toBatch = await this.batchRepo.findById(toBatchId);
    if (!toBatch) {
      return;
    }

    this.domainService.ensureBatchHasCapacity(toBatch);
    toBatch.update({
      enrolledCount: toBatch.enrolledCount + 1,
      updatedBy: actorId,
    });
    await this.batchRepo.save(toBatch);
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
