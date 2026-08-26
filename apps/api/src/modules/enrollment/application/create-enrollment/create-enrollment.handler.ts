import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { PaymentStatus as PaymentTransactionStatus } from '@modules/payment/domain/enums/payment-status.enum';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  InvalidDiscountException,
  InvalidPaymentAmountException,
} from '../../domain/errors/enrollment-business.exception';
import { GetEnrollmentResult } from '../get-enrollment/get-enrollment.result';
import { EnrollmentPaymentRecordingService } from '../shared/enrollment-payment-recording.service';
import { EnrollmentSideEffectsService } from '../shared/enrollment-side-effects.service';

import { CreateEnrollmentCommand } from './create-enrollment.command';

const round = (value: number) => Math.round(value * 100) / 100;

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
    private readonly paymentRecording: EnrollmentPaymentRecordingService,
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
        expectedBranchId: command.expectedBranchId,
      },
    );

    await this.domainService.ensureBatchHasCapacity(hierarchy.batch);

    await this.domainService.ensureNotDuplicate(
      this.enrollmentRepo,
      command.studentId,
      command.batchId,
    );

    const discountAmount = command.discountAmount ?? 0;

    if (discountAmount > command.feeAmount) {
      throw new InvalidDiscountException();
    }

    const finalAmount = round(command.feeAmount - discountAmount);
    const initialPaymentAmount = round(command.initialPaymentAmount ?? 0);

    if (initialPaymentAmount > finalAmount) {
      throw new InvalidPaymentAmountException();
    }

    if (initialPaymentAmount > 0 && !command.paymentMethod) {
      throw new InvalidPaymentAmountException();
    }

    let scheduledSuccessTotal = 0;

    for (const installment of command.installments ?? []) {
      const status =
        installment.paymentStatus ?? PaymentTransactionStatus.PENDING;

      if (status === PaymentTransactionStatus.SUCCESS) {
        scheduledSuccessTotal = round(
          scheduledSuccessTotal + installment.amount,
        );
      }
    }

    if (round(initialPaymentAmount + scheduledSuccessTotal) > finalAmount) {
      throw new InvalidPaymentAmountException();
    }

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

    const admissionDate = command.admissionDate ?? new Date();
    const isAdminSource = command.source === EnrollmentSource.ADMIN;

    const enrollment = Enrollment.create({
      id: randomUUID(),
      enrollmentNumber,
      studentId: command.studentId,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: command.batchId,
      admissionDate,
      joiningDate: hierarchy.batch.startDate,
      expectedCompletionDate: hierarchy.batch.endDate,
      feeAmount: command.feeAmount,
      discountAmount,
      paidAmount: 0,
      status: isAdminSource
        ? EnrollmentStatus.ADMITTED
        : EnrollmentStatus.PENDING,
      source: command.source,
      remarks: undefined,
      createdBy: command.createdBy,
    });

    await this.enrollmentRepo.save(enrollment);

    await this.sideEffects.apply(enrollment, null, command.createdBy);

    const currency = 'INR';

    if (initialPaymentAmount > 0 && command.paymentMethod) {
      await this.paymentRecording.record({
        enrollmentId: enrollment.id,
        studentId: command.studentId,
        amount: initialPaymentAmount,
        currency,
        paymentMethod: command.paymentMethod,
        paymentStatus: PaymentTransactionStatus.SUCCESS,
        transactionId: command.transactionId,
        paidAt: command.initialPaymentPaidAt ?? admissionDate,
        createdBy: command.createdBy,
      });
    }

    for (const installment of command.installments ?? []) {
      const paymentStatus =
        installment.paymentStatus ?? PaymentTransactionStatus.PENDING;

      await this.paymentRecording.record({
        enrollmentId: enrollment.id,
        studentId: command.studentId,
        amount: installment.amount,
        currency,
        paymentMethod: installment.paymentMethod,
        paymentStatus,
        transactionId: installment.transactionId,
        remarks: installment.dueDate
          ? `Installment due ${installment.dueDate}`
          : 'Scheduled installment',
        paidAt:
          paymentStatus === PaymentTransactionStatus.SUCCESS
            ? installment.dueDate
              ? new Date(installment.dueDate)
              : admissionDate
            : undefined,
        createdBy: command.createdBy,
      });
    }

    this.logger.log(`✅ Enrollment created: ${enrollment.id}`);

    return this.domainService.ensureDetailExists(
      await this.enrollmentRepo.findDetailById(enrollment.id, true),
    );
  }
}
