import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { ApplicationType as StudentApplicationType } from '@modules/student/domain/enums/application-type.enum';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentAlreadyExistsException } from '../../domain/errors/enrollment-already-exists.exception';
import {
  BatchNotFoundException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { mapCourseModeToEnrollmentMode } from '../../domain/utils/map-course-mode-to-enrollment-mode';
import {
  assertBatchTimingHasLiveCapacity,
  syncBatchTimingEnrolledCount,
} from '../../infrastructure/utils/enrollment-timing-count.util';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { CreatePublicEnrollmentCommand } from './create-public-enrollment.command';

export class CreatePublicEnrollmentHandler {
  private readonly logger = new Logger(
    CreatePublicEnrollmentHandler.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly courseRepo: CourseRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: CreatePublicEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    // The logged-in user already owns a Student profile; never create one.
    const student =
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        command.userId,
      );

    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student profile not found.',
        404,
      );
    }

    if (student.applicationType !== StudentApplicationType.ONLINE) {
      student.update({
        applicationType: StudentApplicationType.ONLINE,
        updatedBy: command.userId,
      });
      await this.studentRepo.save(student);
    }

    const hierarchy = await this.domainService.validateHierarchy(
      {
        studentRepo: this.studentRepo,
        branchRepo: this.branchRepo,
        categoryRepo: this.categoryRepo,
        courseRepo: this.courseRepo,
        batchRepo: this.batchRepo,
      },
      {
        studentId: student.id,
        batchId: command.batchId,
        expectedBranchId: command.expectedBranchId,
        expectedCourseId: command.expectedCourseId,
      },
    );

    const batchTiming = await this.resolveBatchTiming(
      command.batchId,
      command.batchTimingId,
    );

    const sameBatchEnrollment =
      await this.enrollmentRepo.findByStudentAndBatch(
        student.id,
        command.batchId,
      );

    if (sameBatchEnrollment?.isCurrent()) {
      // Repair legacy PUBLIC rows created before applicationType / batchTiming
      // were persisted correctly (do not invent a new enrollment).
      const needsRepair =
        sameBatchEnrollment.applicationType !== ApplicationType.ONLINE ||
        sameBatchEnrollment.source !== EnrollmentSource.PUBLIC ||
        !sameBatchEnrollment.batchTimingId ||
        sameBatchEnrollment.batchTimingId !== batchTiming.id ||
        sameBatchEnrollment.mode !==
          mapCourseModeToEnrollmentMode(batchTiming.mode);

      if (needsRepair) {
        sameBatchEnrollment.update({
          applicationType: ApplicationType.ONLINE,
          batchTimingId: batchTiming.id,
          mode: mapCourseModeToEnrollmentMode(batchTiming.mode),
          joiningDate: batchTiming.startDate,
          expectedCompletionDate: batchTiming.endDate,
          updatedBy: command.userId,
        });
        await this.enrollmentRepo.save(sameBatchEnrollment);

        if (
          sameBatchEnrollment.status === EnrollmentStatus.ADMITTED ||
          sameBatchEnrollment.status === EnrollmentStatus.ACTIVE
        ) {
          await syncBatchTimingEnrolledCount(this.prisma, batchTiming.id);
        }
      }

      const detail = await this.enrollmentRepo.findDetailById(
        sameBatchEnrollment.id,
        true,
      );
      if (detail) {
        const inProgress =
          detail.status === EnrollmentStatus.PENDING ||
          detail.status === EnrollmentStatus.PENDING_APPROVAL ||
          detail.status === EnrollmentStatus.ADMITTED ||
          detail.status === EnrollmentStatus.ACTIVE;

        if (inProgress) {
          return detail;
        }
      }
    }

    await assertBatchTimingHasLiveCapacity(this.prisma, batchTiming.id);

    await this.domainService.ensureNotDuplicate(
      this.enrollmentRepo,
      student.id,
      command.batchId,
    );

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

    const pricing = hierarchy.batch.getPricing();
    const isComplimentary =
      pricing.isFree || pricing.discountedPrice <= 0;

    const mode = mapCourseModeToEnrollmentMode(batchTiming.mode);

    const enrollment = Enrollment.create({
      id: randomUUID(),
      enrollmentNumber,
      studentId: student.id,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: command.batchId,
      batchTimingId: batchTiming.id,
      admissionDate: isComplimentary ? new Date() : null,
      joiningDate: batchTiming.startDate,
      expectedCompletionDate: batchTiming.endDate,
      feeAmount: pricing.originalPrice,
      discountAmount: pricing.discountAmount,
      paidAmount: 0,
      status: isComplimentary
        ? EnrollmentStatus.ADMITTED
        : EnrollmentStatus.PENDING,
      source: EnrollmentSource.PUBLIC,
      applicationType: ApplicationType.ONLINE,
      mode,
      remarks: undefined,
      isActive: isComplimentary,
      createdBy: command.userId,
    });

    if (isComplimentary) {
      await this.sideEffects.assertCapacityForTransition(
        enrollment,
        null,
      );
    }

    await this.enrollmentRepo.save(enrollment);

    if (isComplimentary) {
      await this.sideEffects.apply(enrollment, null, command.userId);
    }

    this.logger.log(
      `✅ Public enrollment created: ${enrollment.id}`,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }

  private async resolveBatchTiming(
    batchId: string,
    batchTimingId: string,
  ): Promise<{
    id: string;
    mode: string;
    startDate: Date;
    endDate: Date | null;
  }> {
    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: batchTimingId,
        batchId,
        isDeleted: false,
        isActive: true,
      },
      select: {
        id: true,
        mode: true,
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
