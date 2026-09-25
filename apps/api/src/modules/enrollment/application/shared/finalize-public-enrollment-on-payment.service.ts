import { randomUUID } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';

import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import { BATCH_TOKENS } from '@modules/batch/batch.tokens';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BRANCH_TOKENS } from '@modules/branch/branch.tokens';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { CATEGORY_TOKENS } from '@modules/category/category.tokens';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import { COURSE_TOKENS } from '@modules/course/course.tokens';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { STUDENT_TOKENS } from '@modules/student/student.tokens';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { Payment } from '../../../payment/domain/entities/payment.entity';
import type { PaymentRepository } from '../../../payment/domain/repositories/payment.repository';
import { PAYMENT_TOKENS } from '../../../payment/payment.tokens';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { ENROLLMENT_TOKENS } from '../../enrollment.tokens';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  parsePublicEnrollmentCheckoutPayload,
  type PublicEnrollmentCheckoutPayload,
} from '../../domain/types/public-enrollment-checkout-payload.type';
import { mapCourseModeToEnrollmentMode } from '../../domain/utils/map-course-mode-to-enrollment-mode';
import {
  hasPaidPublicOnlineAdvance,
  PUBLIC_ONLINE_ADVANCE_AMOUNT,
} from '../../domain/utils/public-online-advance.util';
import {
  assertBatchTimingHasLiveCapacity,
} from '../../infrastructure/utils/enrollment-timing-count.util';
import { EnrollmentCoinService } from './enrollment-coin.service';
import { EnrollmentSideEffectsService } from './enrollment-side-effects.service';

@Injectable()
export class FinalizePublicEnrollmentOnPaymentService {
  private readonly logger = new Logger(
    FinalizePublicEnrollmentOnPaymentService.name,
  );

  constructor(
    @Inject(ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: EnrollmentRepository,
    @Inject(STUDENT_TOKENS.STUDENT_REPOSITORY)
    private readonly studentRepo: StudentRepository,
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
    @Inject(CATEGORY_TOKENS.CATEGORY_REPOSITORY)
    private readonly categoryRepo: CategoryRepository,
    @Inject(COURSE_TOKENS.COURSE_REPOSITORY)
    private readonly courseRepo: CourseRepository,
    @Inject(BATCH_TOKENS.BATCH_REPOSITORY)
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    @Inject(PAYMENT_TOKENS.PAYMENT_REPOSITORY)
    private readonly paymentRepo: PaymentRepository,
    private readonly sideEffects: EnrollmentSideEffectsService,
    private readonly enrollmentCoinService: EnrollmentCoinService,
    private readonly prisma: PrismaService,
  ) {}

  async finalizeIfNeeded(payment: Payment): Promise<void> {
    if (!payment.isEnrollmentCheckout()) {
      return;
    }

    if (payment.enrollmentId) {
      return;
    }

    const payload = parsePublicEnrollmentCheckoutPayload(
      payment.checkoutPayload,
    );

    if (!payload) {
      this.logger.warn(
        `Payment ${payment.id} has invalid checkout payload; skipping finalize`,
      );
      return;
    }

    if (!payment.isSuccessful()) {
      return;
    }

    if (
      payment.amount <
      Math.min(PUBLIC_ONLINE_ADVANCE_AMOUNT, payment.amount)
    ) {
      this.logger.warn(
        `Payment ${payment.id} amount ${payment.amount} is below advance threshold`,
      );
    }

    const student = await this.studentRepo.findById(payment.studentId, true);
    if (!student) {
      this.logger.warn(
        `Student ${payment.studentId} missing for payment ${payment.id}`,
      );
      return;
    }

    await this.domainService.ensureNoActiveEnrollmentForPublicCheckout(
      this.enrollmentRepo,
      student.id,
      payload,
    );

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
        batchId: payload.batchId,
        expectedBranchId: payload.branchId,
        expectedCourseId: payload.courseId,
      },
    );

    const batchTiming = await this.resolveBatchTiming(
      payload.batchId,
      payload.batchTimingId,
    );

    await assertBatchTimingHasLiveCapacity(this.prisma, batchTiming.id);

    await this.domainService.ensureNoBlockingCourseEnrollment(
      this.enrollmentRepo,
      student.id,
      hierarchy.courseId,
    );

    await this.domainService.ensureNotDuplicate(
      this.enrollmentRepo,
      student.id,
      payload.batchId,
    );

    const enrollmentNumber =
      await this.domainService.generateUniqueEnrollmentNumber(
        this.enrollmentRepo,
      );

    const pricing = hierarchy.batch.getPricing();
    const mode = mapCourseModeToEnrollmentMode(batchTiming.mode);

    const enrollmentId = randomUUID();
    const enrollment = Enrollment.create({
      id: enrollmentId,
      enrollmentNumber,
      studentId: student.id,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: payload.batchId,
      batchTimingId: batchTiming.id,
      admissionDate: null,
      joiningDate: batchTiming.startDate,
      expectedCompletionDate: batchTiming.endDate,
      feeAmount: pricing.originalPrice,
      discountAmount: pricing.discountAmount,
      paidAmount: 0,
      status: EnrollmentStatus.PENDING,
      source: EnrollmentSource.PUBLIC,
      applicationType: ApplicationType.ONLINE,
      mode,
      remarks: undefined,
      isActive: false,
      createdBy: payment.createdBy,
    });

    await this.enrollmentRepo.save(enrollment);

    if (payload.coinsToRedeem > 0) {
      await this.enrollmentCoinService.applyCoinsToEnrollment(
        student.userId,
        enrollmentId,
        payload.coinsToRedeem,
      );
    }

    const persisted = await this.enrollmentRepo.findById(enrollmentId, true);
    if (!persisted) {
      throw new Error('Enrollment finalize failed');
    }

    persisted.update({
      paidAmount: payment.amount,
      status: EnrollmentStatus.ADVANCED,
      updatedBy: payment.createdBy,
    });

    if (!hasPaidPublicOnlineAdvance(persisted.paidAmount)) {
      this.logger.warn(
        `Payment ${payment.id} did not meet advance threshold after finalize`,
      );
    }

    await this.enrollmentRepo.save(persisted);

    payment.attachEnrollment(persisted.id, payment.createdBy);
    await this.paymentRepo.save(payment);

    if (persisted.redeemedCoins > 0) {
      await this.enrollmentCoinService.commitCoinsForEnrollment(persisted);
    }

    await this.sideEffects.syncStudentStatusForStudentId(
      student.id,
      payment.createdBy,
    );

    this.logger.log(
      `✅ Finalized public enrollment ${persisted.id} from payment ${payment.id}`,
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
      throw new Error('Batch timing not found');
    }

    return timing;
  }
}
