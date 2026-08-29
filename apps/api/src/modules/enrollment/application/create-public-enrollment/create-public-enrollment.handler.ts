import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentAlreadyExistsException } from '../../domain/errors/enrollment-already-exists.exception';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';

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
  ) {}

  async execute(
    command: CreatePublicEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    // The logged-in user already owns a Student profile; never create one.
    const student = await this.studentRepo.findByCreatedBy(
      command.userId,
    );

    if (!student) {
      throw new BaseException(
        ERROR_CODES.STUDENT_NOT_FOUND,
        'Student profile not found.',
        404,
      );
    }

    // Identical to Admin Enrollment: branch, category and course are derived
    // and validated from the batch — client values are never trusted.
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

    await this.domainService.ensureBatchHasCapacity(
      hierarchy.batch,
    );

    const currentEnrollment =
      await this.enrollmentRepo.findCurrentDetailByStudentId(student.id);

    if (currentEnrollment) {
      const inProgress =
        currentEnrollment.status === EnrollmentStatus.PENDING ||
        currentEnrollment.status === EnrollmentStatus.PENDING_APPROVAL;

      if (inProgress && currentEnrollment.batch.id === command.batchId) {
        return currentEnrollment;
      }

      throw EnrollmentAlreadyExistsException.forCurrentEnrollment(
        currentEnrollment,
        command.batchId,
      );
    }

    await this.domainService.ensureNotDuplicate(
      this.enrollmentRepo,
      student.id,
      command.batchId,
    );

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

    // Pricing is always derived from the Course — the public client never sends
    // any financial values. This snapshot stays fixed even if the course price
    // changes later.
    const pricing = hierarchy.course.getPricing();
    const isComplimentary =
      pricing.isFree || pricing.discountedPrice <= 0;

    const enrollment = Enrollment.create({
      id: randomUUID(),
      enrollmentNumber,
      studentId: student.id,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: command.batchId,
      admissionDate: null,
      joiningDate: hierarchy.batch.startDate,
      expectedCompletionDate: hierarchy.batch.endDate,
      feeAmount: pricing.originalPrice,
      discountAmount: pricing.discountAmount,
      paidAmount: 0,
      status: isComplimentary
        ? EnrollmentStatus.PENDING_APPROVAL
        : EnrollmentStatus.PENDING,
      source: EnrollmentSource.PUBLIC,
      remarks: command.remarks,
      createdBy: command.userId,
    });

    await this.enrollmentRepo.save(enrollment);

    this.logger.log(
      `✅ Public enrollment created: ${enrollment.id}`,
    );

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
