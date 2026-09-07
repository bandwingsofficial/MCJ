import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import {
  BatchNotFoundException,
  InvalidDiscountException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { UpdateEnrollmentCommand } from './update-enrollment.command';

export class UpdateEnrollmentHandler {
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly courseRepo: CourseRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: UpdateEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const enrollment = this.domainService.ensureExists(
      await this.enrollmentRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(enrollment);

    this.domainService.ensureBranchAccess(
      enrollment,
      command.actorBranchId,
    );

    this.domainService.ensureMutable(enrollment);

    const previousStatus = enrollment.status;
    const previousBatchId = enrollment.batchId;
    const previousBatchTimingId = enrollment.batchTimingId;
    const previousStudentId = enrollment.studentId;
    const nextStudentId = command.studentId ?? enrollment.studentId;
    const nextBatchId = command.batchId ?? enrollment.batchId;
    const hierarchyChanged =
      nextStudentId !== enrollment.studentId ||
      nextBatchId !== enrollment.batchId;

    if (command.status !== undefined) {
      this.domainService.ensureValidStatusTransition(
        previousStatus,
        command.status,
      );
    }

    let joiningDate: Date | null | undefined = command.joiningDate;
    let expectedCompletionDate: Date | null | undefined =
      command.expectedCompletionDate;
    let branchId: string | undefined;
    let categoryId: string | undefined;
    let courseId: string | undefined;
    let batchTimingId: string | null | undefined;

    if (command.batchTimingId !== undefined) {
      if (command.batchTimingId) {
        const batchTiming = await this.resolveBatchTiming(
          nextBatchId,
          command.batchTimingId,
        );

        batchTimingId = batchTiming.id;

        if (command.joiningDate === undefined) {
          joiningDate = batchTiming.startDate;
        }

        if (command.expectedCompletionDate === undefined) {
          expectedCompletionDate = batchTiming.endDate;
        }
      } else {
        batchTimingId = null;
      }
    }

    if (hierarchyChanged) {
      const hierarchy = await this.domainService.validateHierarchy(
        {
          studentRepo: this.studentRepo,
          branchRepo: this.branchRepo,
          categoryRepo: this.categoryRepo,
          courseRepo: this.courseRepo,
          batchRepo: this.batchRepo,
        },
        {
          studentId: nextStudentId,
          batchId: nextBatchId,
        },
      );

      await this.domainService.ensureNotDuplicate(
        this.enrollmentRepo,
        nextStudentId,
        nextBatchId,
        enrollment.id,
      );

      branchId = hierarchy.branchId;
      categoryId = hierarchy.categoryId;
      courseId = hierarchy.courseId;
      joiningDate = joiningDate ?? hierarchy.batch.startDate;
      expectedCompletionDate =
        expectedCompletionDate ?? hierarchy.batch.endDate;
    }

    if (
      command.feeAmount !== undefined ||
      command.discountAmount !== undefined
    ) {
      const feeAmount = command.feeAmount ?? enrollment.feeAmount;
      const discountAmount =
        command.discountAmount ?? enrollment.discountAmount;

      if (discountAmount > feeAmount) {
        throw new InvalidDiscountException();
      }
    }

    enrollment.update({
      studentId: command.studentId,
      batchId: command.batchId,
      batchTimingId,
      branchId,
      categoryId,
      courseId,
      admissionDate: command.admissionDate,
      joiningDate,
      expectedCompletionDate,
      feeAmount: command.feeAmount,
      discountAmount: command.discountAmount,
      paidAmount: command.paidAmount,
      remarks: command.remarks,
      status: command.status,
      isActive: command.isActive,
      updatedBy: command.updatedBy,
    });

    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      previousStatus,
      { previousBatchTimingId },
    );

    await this.enrollmentRepo.save(enrollment);

    const timingChanged =
      previousBatchTimingId !== enrollment.batchTimingId;

    if (
      enrollment.occupiesSeat() &&
      previousBatchId !== enrollment.batchId
    ) {
      await this.sideEffects.transferSeat(
        previousBatchId,
        enrollment.batchId,
        command.updatedBy,
      );
    } else if (
      command.status !== undefined &&
      command.status !== previousStatus
    ) {
      await this.sideEffects.apply(
        enrollment,
        previousStatus,
        command.updatedBy,
      );
    } else if (
      command.studentId !== undefined &&
      command.studentId !== previousStudentId
    ) {
      await this.sideEffects.apply(
        enrollment,
        previousStatus,
        command.updatedBy,
      );
    }

    if (timingChanged) {
      await this.sideEffects.syncBatchTimingTransfer(
        previousBatchTimingId,
        enrollment.batchTimingId,
        previousStatus,
        enrollment.status,
      );
    }

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }

  private async resolveBatchTiming(batchId: string, batchTimingId: string) {
    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: batchTimingId,
        batchId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        batchId: true,
        enrolledCount: true,
        capacity: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!timing) {
      throw new BatchNotFoundException();
    }

    return timing;
  }
}
