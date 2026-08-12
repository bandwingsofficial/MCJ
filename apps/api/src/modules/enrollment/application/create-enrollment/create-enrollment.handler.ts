import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { CreateEnrollmentCommand } from './create-enrollment.command';

export class CreateEnrollmentHandler {
  private readonly logger = new Logger(
    CreateEnrollmentHandler.name,
  );

  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly courseRepo: CourseRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly sideEffects: EnrollmentSideEffectsService,
  ) {}

  async execute(
    command: CreateEnrollmentCommand,
  ): Promise<GetEnrollmentResult> {
    const hierarchy = await this.domainService.validateHierarchy(
      {
        studentRepo: this.studentRepo,
        branchRepo: this.branchRepo,
        categoryRepo: this.categoryRepo,
        courseRepo: this.courseRepo,
        batchRepo: this.batchRepo,
      },
      {
        studentId: command.studentId,
        batchId: command.batchId,
      },
    );
    
    await this.domainService.ensureBatchHasCapacity(
  hierarchy.batch,
);

    await this.domainService.ensureNotDuplicate(
      this.enrollmentRepo,
      command.studentId,
      command.batchId,
    );

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

    // Snapshot the fee from the Course at the time of enrollment. Admin-provided
    // values take precedence over course pricing; otherwise course pricing is used.
    const courseFee = hierarchy.course.originalPrice.getValue();
    const courseDiscount = hierarchy.course.getTotalDiscount();

    const enrollment = Enrollment.create({
      id: randomUUID(),
      enrollmentNumber,
      studentId: command.studentId,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: command.batchId,
      admissionDate: null,
      joiningDate: hierarchy.batch.startDate,
      expectedCompletionDate: hierarchy.batch.endDate,
      feeAmount: command.feeAmount ?? courseFee,
      discountAmount: command.discountAmount ?? courseDiscount,
      paidAmount: command.paidAmount ?? 0,
      status: EnrollmentStatus.PENDING,
      source: command.source,
      remarks: command.remarks,
      createdBy: command.createdBy,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.sideEffects.apply(enrollment, null, command.createdBy);

    this.logger.log(`✅ Enrollment created: ${enrollment.id}`);

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
