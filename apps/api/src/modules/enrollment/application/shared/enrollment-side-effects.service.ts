import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { RestoreBatchFullException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  assertBatchTimingHasLiveCapacity,
  isTimingLinkedEnrollmentStatus,
  syncBatchTimingEnrolledCount,
} from '../../infrastructure/utils/enrollment-timing-count.util';

// Synchronizes batch and batch-timing seat counts with enrollment status changes.
export class EnrollmentSideEffectsService {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly studentRepo: StudentRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly prisma: PrismaService,
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
    await this.syncBatchTimingSeatCount(
      enrollment,
      previousStatus,
    );
    await this.syncStudentStatus(enrollment, actorId);
  }

  async assertCapacityForTransition(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
    options?: {
      restore?: boolean;
      previousBatchTimingId?: string | null;
    },
  ): Promise<void> {
    const timingChanged =
      options?.previousBatchTimingId !== undefined &&
      options.previousBatchTimingId !== enrollment.batchTimingId;

    if (
      timingChanged &&
      enrollment.batchTimingId &&
      isTimingLinkedEnrollmentStatus(enrollment.status)
    ) {
      await assertBatchTimingHasLiveCapacity(
        this.prisma,
        enrollment.batchTimingId,
      );
    }

    const wasOccupying = previousStatus
      ? Enrollment.statusOccupiesSeat(previousStatus)
      : false;

    if (!enrollment.occupiesSeat() || wasOccupying) {
      return;
    }

    if (enrollment.batchTimingId) {
      try {
        await assertBatchTimingHasLiveCapacity(
          this.prisma,
          enrollment.batchTimingId,
        );
      } catch (error) {
        if (options?.restore) {
          throw new RestoreBatchFullException();
        }

        throw error;
      }

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
      if (enrollment.batchTimingId) {
        await assertBatchTimingHasLiveCapacity(
          this.prisma,
          enrollment.batchTimingId,
        );
      } else {
        this.domainService.ensureBatchHasCapacity(batch);
      }
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

  private async syncBatchTimingSeatCount(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
  ): Promise<void> {
    if (!enrollment.batchTimingId) {
      return;
    }

    const wasLinked =
      previousStatus !== null &&
      isTimingLinkedEnrollmentStatus(previousStatus);
    const isLinked = isTimingLinkedEnrollmentStatus(enrollment.status);

    if (wasLinked === isLinked) {
      return;
    }

    await syncBatchTimingEnrolledCount(
      this.prisma,
      enrollment.batchTimingId,
    );
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

  async syncBatchTimingTransfer(
    fromBatchTimingId: string | null,
    toBatchTimingId: string | null,
    previousStatus: EnrollmentStatus,
    currentStatus: EnrollmentStatus,
  ): Promise<void> {
    if (fromBatchTimingId === toBatchTimingId) {
      return;
    }

    const wasLinked = isTimingLinkedEnrollmentStatus(previousStatus);
    const isLinked = isTimingLinkedEnrollmentStatus(currentStatus);

    if (fromBatchTimingId && wasLinked) {
      await syncBatchTimingEnrolledCount(
        this.prisma,
        fromBatchTimingId,
      );
    }

    if (toBatchTimingId && isLinked) {
      await syncBatchTimingEnrolledCount(
        this.prisma,
        toBatchTimingId,
      );
    }
  }

  async transferSeat(
    fromBatchId: string,
    toBatchId: string,
    actorId?: string | null,
    options?: { batchTimingId?: string | null },
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

    if (options?.batchTimingId) {
      await assertBatchTimingHasLiveCapacity(
        this.prisma,
        options.batchTimingId,
      );
    } else {
      this.domainService.ensureBatchHasCapacity(toBatch);
    }
    toBatch.update({
      enrolledCount: toBatch.enrolledCount + 1,
      updatedBy: actorId,
    });
    await this.batchRepo.save(toBatch);
  }

  async releaseSeat(
    enrollment: Enrollment,
    actorId?: string | null,
  ): Promise<void> {
    if (enrollment.occupiesSeat()) {
      const batch = await this.batchRepo.findById(
        enrollment.batchId,
      );
      if (batch) {
        batch.update({
          enrolledCount: Math.max(0, batch.enrolledCount - 1),
          updatedBy: actorId,
        });
        await this.batchRepo.save(batch);
      }
    }

    if (
      enrollment.batchTimingId &&
      isTimingLinkedEnrollmentStatus(enrollment.status)
    ) {
      await syncBatchTimingEnrolledCount(
        this.prisma,
        enrollment.batchTimingId,
      );
    }
  }
}
