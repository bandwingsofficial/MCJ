import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { RestoreBatchFullException } from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  assertBatchTimingHasLiveCapacity,
  isTimingLinkedEnrollmentStatus,
  syncAllBatchTimingEnrolledCounts,
  syncBatchTimingEnrolledCount,
} from '../../infrastructure/utils/enrollment-timing-count.util';
import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

/** Status update on an enrollment already in the batch — not a new seat. */
function isInPlaceSeatPromotion(
  previousStatus: EnrollmentStatus | null,
  nextOccupiesSeat: boolean,
): boolean {
  if (!previousStatus || !nextOccupiesSeat) {
    return false;
  }

  if (Enrollment.statusOccupiesSeat(previousStatus)) {
    return true;
  }

  return Enrollment.isCurrentStatus(previousStatus);
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
    options?: { skipStudentStatusSync?: boolean },
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
    await this.syncStudentBranchFromEnrollment(enrollment, actorId);
    if (!options?.skipStudentStatusSync) {
      await this.syncStudentStatusForStudentId(
        enrollment.studentId,
        actorId,
      );
    }
  }

  async syncStudentStatusForStudentId(
    studentId: string,
    actorId?: string | null,
    excludeEnrollmentId?: string,
  ): Promise<void> {
    const currentRecord = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        isDeleted: false,
        status: { in: Enrollment.currentStatuses() },
        ...(excludeEnrollmentId
          ? { id: { not: excludeEnrollmentId } }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      select: { status: true },
    });

    const primaryRecord =
      currentRecord ??
      (await this.prisma.enrollment.findFirst({
        where: {
          studentId,
          isDeleted: false,
          ...(excludeEnrollmentId
            ? { id: { not: excludeEnrollmentId } }
            : {}),
        },
        orderBy: { updatedAt: 'desc' },
        select: { status: true },
      }));

    if (!primaryRecord) {
      return;
    }

    const nextStatus = this.domainService.resolveWorkflowStatusFromEnrollmentStatus(
      primaryRecord.status as EnrollmentStatus,
    ) as StudentStatus;

    const student = await this.studentRepo.findById(studentId);
    if (!student) {
      return;
    }

    if (student.status === nextStatus) {
      return;
    }

    student.update({
      status: nextStatus,
      updatedBy: actorId,
    });

    await this.studentRepo.save(student);

    notifyDomainMutation({
      domain: 'student',
      action: 'status_changed',
      entityId: student.id,
      branchId: student.branchId ?? undefined,
    });
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

    if (
      isInPlaceSeatPromotion(previousStatus, enrollment.occupiesSeat())
    ) {
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

    const inPlacePromotion = isInPlaceSeatPromotion(
      previousStatus,
      isOccupying,
    );

    const batch = await this.batchRepo.findById(
      enrollment.batchId,
    );
    if (!batch) {
      return;
    }

    if (isOccupying) {
      if (!inPlacePromotion) {
        // Capacity is validated before the enrollment row is saved (create/update).
        // Re-checking here after save counts the new row and falsely throws "batch full".
        const skipCapacityAssert = previousStatus === null;

        if (!skipCapacityAssert) {
          if (enrollment.batchTimingId) {
            await assertBatchTimingHasLiveCapacity(
              this.prisma,
              enrollment.batchTimingId,
            );
          } else {
            this.domainService.ensureBatchHasCapacity(batch);
          }
        }

        batch.update({
          enrolledCount: batch.enrolledCount + 1,
          updatedBy: actorId,
        });
      }
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

  async syncStudentBranchFromEnrollment(
    enrollment: Enrollment,
    actorId?: string | null,
  ): Promise<void> {
    const student = await this.studentRepo.findById(enrollment.studentId);
    if (!student) {
      return;
    }

    if (student.branchId === enrollment.branchId) {
      return;
    }

    student.update({
      branchId: enrollment.branchId,
      updatedBy: actorId,
    });

    await this.studentRepo.save(student);
  }

  async reconcileBatchAssignmentSeatCounts(params: {
    enrollment: Enrollment;
    previousBatchId: string;
    previousBatchTimingId: string | null;
    previousStatus: EnrollmentStatus;
    actorId?: string | null;
  }): Promise<void> {
    const {
      enrollment,
      previousBatchId,
      previousBatchTimingId,
      previousStatus,
      actorId,
    } = params;

    const batchChanged = previousBatchId !== enrollment.batchId;
    const timingChanged =
      previousBatchTimingId !== enrollment.batchTimingId;

    if (!batchChanged && !timingChanged) {
      return;
    }

    const wasOccupying = Enrollment.statusOccupiesSeat(previousStatus);
    const isOccupying = enrollment.occupiesSeat();

    if (!wasOccupying && !isOccupying) {
      return;
    }

    if (
      batchChanged &&
      wasOccupying &&
      isOccupying
    ) {
      await this.transferSeat(
        previousBatchId,
        enrollment.batchId,
        actorId,
        { batchTimingId: enrollment.batchTimingId },
      );
    }

    if (timingChanged || batchChanged) {
      await this.syncBatchTimingTransfer(
        previousBatchTimingId,
        enrollment.batchTimingId,
        previousStatus,
        enrollment.status,
      );
    }

    if (batchChanged) {
      await syncAllBatchTimingEnrolledCounts(
        this.prisma,
        previousBatchId,
      );
      await syncAllBatchTimingEnrolledCounts(
        this.prisma,
        enrollment.batchId,
      );
    }
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
