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
import {
  BatchNotFoundException,
} from '../../domain/errors/enrollment-business.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { mapCourseModeToEnrollmentMode } from '../../domain/utils/map-course-mode-to-enrollment-mode';
import {
  assertBatchTimingHasLiveCapacity,
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

    const pricing = hierarchy.batch.getPricing();
    const isComplimentary =
      pricing.isFree || pricing.discountedPrice <= 0;

    if (!isComplimentary) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Paid enrollments must complete the ₹500 advance payment before an enrollment is created.',
        400,
      );
    }

    await assertBatchTimingHasLiveCapacity(this.prisma, batchTiming.id);

    await this.domainService.ensureNoBlockingCourseEnrollment(
      this.enrollmentRepo,
      student.id,
      hierarchy.courseId,
    );

    await this.domainService.ensureNoCurrentEnrollment(
      this.enrollmentRepo,
      student.id,
    );

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

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
      status: EnrollmentStatus.ADMITTED,
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
