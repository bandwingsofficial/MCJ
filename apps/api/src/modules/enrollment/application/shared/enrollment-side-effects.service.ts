import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { BatchFullException } from '../../domain/errors/batch-full.exception';
import { RestoreBatchFullException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';

const TIMING_LINKED_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.PENDING,
  EnrollmentStatus.PENDING_APPROVAL,
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

function isTimingLinkedStatus(status: EnrollmentStatus): boolean {
  return TIMING_LINKED_STATUSES.includes(status);
}

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

    if (enrollment.batchTimingId) {
      await this.assertBatchTimingHasCapacity(enrollment.batchTimingId);
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

  private async syncBatchTimingSeatCount(
    enrollment: Enrollment,
    previousStatus: EnrollmentStatus | null,
  ): Promise<void> {
    if (!enrollment.batchTimingId) {
      return;
    }

    const wasLinked =
      previousStatus !== null && isTimingLinkedStatus(previousStatus);
    const isLinked = isTimingLinkedStatus(enrollment.status);

    if (wasLinked === isLinked || !wasLinked) {
      return;
    }

    await this.decrementBatchTimingSeat(enrollment.batchTimingId);
  }

  private async decrementBatchTimingSeat(
    batchTimingId: string,
  ): Promise<void> {
    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: batchTimingId,
        isDeleted: false,
      },
      select: {
        id: true,
        enrolledCount: true,
      },
    });

    if (!timing) {
      return;
    }

    await this.prisma.batchTiming.update({
      where: { id: timing.id },
      data: {
        enrolledCount: Math.max(0, timing.enrolledCount - 1),
      },
    });
  }

  private async assertBatchTimingHasCapacity(
    batchTimingId: string,
  ): Promise<void> {
    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: batchTimingId,
        isDeleted: false,
      },
      select: {
        enrolledCount: true,
        capacity: true,
      },
    });

    if (!timing) {
      return;
    }

    if (timing.enrolledCount >= timing.capacity) {
      throw new BatchFullException();
    }
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
      isTimingLinkedStatus(enrollment.status)
    ) {
      await this.decrementBatchTimingSeat(enrollment.batchTimingId);
    }
  }
}
