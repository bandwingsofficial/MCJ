import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentMode } from '../../domain/enums/enrollment-mode.enum';
import {
  BatchBranchMismatchException,
  BatchCourseMismatchException,
  BatchNotFoundException,
  InvalidDiscountException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { mapCourseModeToEnrollmentMode } from '../../domain/utils/map-course-mode-to-enrollment-mode';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

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
    let mode: EnrollmentMode | undefined;
    let resolvedBatchTiming:
      | Awaited<ReturnType<UpdateEnrollmentHandler['resolveBatchTiming']>>
      | null = null;

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
          actorBranchId: command.actorBranchId,
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

    if (command.batchTimingId !== undefined) {
      if (command.batchTimingId) {
        resolvedBatchTiming = await this.resolveBatchTiming(
          nextBatchId,
          command.batchTimingId,
        );

        batchTimingId = resolvedBatchTiming.id;
        mode = mapCourseModeToEnrollmentMode(resolvedBatchTiming.mode);

        if (
          command.mode !== undefined &&
          command.mode !== mode
        ) {
          throw new BaseException(
            ERROR_CODES.VALIDATION_ERROR,
            'Selected mode does not match the batch timing.',
            400,
          );
        }

        const assignmentBranchId =
          branchId ?? command.actorBranchId ?? enrollment.branchId;
        const assignmentCourseId = courseId ?? enrollment.courseId;

        await this.assertEnrollmentAssignmentContext(
          assignmentBranchId,
          assignmentCourseId,
          nextBatchId,
          resolvedBatchTiming.id,
          resolvedBatchTiming.mode,
        );

        if (command.joiningDate === undefined) {
          joiningDate = resolvedBatchTiming.startDate;
        }

        if (command.expectedCompletionDate === undefined) {
          expectedCompletionDate = resolvedBatchTiming.endDate;
        }
      } else {
        batchTimingId = null;
        if (command.mode !== undefined) {
          mode = command.mode;
        }
      }
    } else if (
      command.batchId !== undefined &&
      command.batchId !== enrollment.batchId &&
      enrollment.batchTimingId
    ) {
      const timingStillValid = await this.prisma.batchTiming.findFirst({
        where: {
          id: enrollment.batchTimingId,
          batchId: nextBatchId,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!timingStillValid) {
        batchTimingId = null;
      }
    } else if (command.mode !== undefined) {
      mode = command.mode;
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
      mode,
      updatedBy: command.updatedBy,
    });

    await this.sideEffects.assertCapacityForTransition(
      enrollment,
      previousStatus,
      { previousBatchTimingId },
    );

    await this.enrollmentRepo.save(enrollment);

    const batchChanged = previousBatchId !== enrollment.batchId;
    const timingChanged =
      previousBatchTimingId !== enrollment.batchTimingId;

    if (batchChanged || timingChanged) {
      await this.sideEffects.reconcileBatchAssignmentSeatCounts({
        enrollment,
        previousBatchId,
        previousBatchTimingId,
        previousStatus,
        actorId: command.updatedBy,
      });
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

    notifyDomainMutation({
      domain: 'enrollment',
      action: 'updated',
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
        mode: true,
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

  private async assertEnrollmentAssignmentContext(
    branchId: string,
    courseId: string,
    batchId: string,
    batchTimingId: string,
    mode: string,
  ): Promise<void> {
    try {
      await this.branchRepo.validateCourseBatchTrainerContext(branchId, {
        courseId,
        batchId,
        batchTimingId,
        mode,
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      switch (error.message) {
        case 'BRANCH_COURSE_NOT_LINKED':
          throw new BatchCourseMismatchException();
        case 'BRANCH_BATCH_NOT_LINKED':
          throw new BatchBranchMismatchException();
        case 'BATCH_NOT_FOUND':
        case 'BATCH_TIMING_NOT_FOUND':
          throw new BatchNotFoundException();
        case 'BATCH_COURSE_MISMATCH':
          throw new BatchCourseMismatchException();
        case 'BATCH_TIMING_MODE_MISMATCH':
          throw new BaseException(
            ERROR_CODES.VALIDATION_ERROR,
            'Selected mode does not match the batch timing.',
            400,
          );
        default:
          throw error;
      }
    }
  }
}
