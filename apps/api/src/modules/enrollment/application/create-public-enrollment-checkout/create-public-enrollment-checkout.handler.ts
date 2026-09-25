import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { ResolveAuthenticatedStudentService } from '@modules/student/domain/services/resolve-authenticated-student.service';
import { Payment } from '@modules/payment/domain/entities/payment.entity';
import { PaymentGateway } from '@modules/payment/domain/enums/payment-gateway.enum';
import { PaymentMethod } from '@modules/payment/domain/enums/payment-method.enum';
import { PaymentStatus } from '@modules/payment/domain/enums/payment-status.enum';
import type { PaymentRepository } from '@modules/payment/domain/repositories/payment.repository';
import type { PaymentGatewayPort } from '@modules/payment/domain/services/payment-gateway.port';
import { PaymentDomainService } from '@modules/payment/domain/services/payment-domain.service';
import { CreatePaymentOrderResult } from '@modules/payment/application/create-payment-order/create-payment-order.result';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { EnrollmentDomainService } from '../../domain/services/enrollment-domain.service';
import {
  PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION,
  type PublicEnrollmentCheckoutPayload,
} from '../../domain/types/public-enrollment-checkout-payload.type';
import {
  PUBLIC_ONLINE_ADVANCE_AMOUNT,
  isPublicOnlineAdvanceEnrollment,
} from '../../domain/utils/public-online-advance.util';
import { mapCourseModeToEnrollmentMode } from '../../domain/utils/map-course-mode-to-enrollment-mode';
import {
  assertBatchTimingHasLiveCapacity,
} from '../../infrastructure/utils/enrollment-timing-count.util';
import { EnrollmentCoinService } from '../shared/enrollment-coin.service';
import { CancelUnpaidPublicEnrollmentService } from '../shared/cancel-unpaid-public-enrollment.service';

import { CreatePublicEnrollmentCheckoutCommand } from './create-public-enrollment-checkout.command';

export class CreatePublicEnrollmentCheckoutHandler {
  private readonly logger = new Logger(
    CreatePublicEnrollmentCheckoutHandler.name,
  );

  constructor(
    private readonly paymentRepo: PaymentRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly courseRepo: CourseRepository,
    private readonly batchRepo: BatchRepository,
    private readonly domainService: EnrollmentDomainService,
    private readonly paymentDomainService: PaymentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly gateway: PaymentGatewayPort,
    private readonly enrollmentCoinService: EnrollmentCoinService,
    private readonly cancelUnpaidPublicEnrollment: CancelUnpaidPublicEnrollmentService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: CreatePublicEnrollmentCheckoutCommand,
  ): Promise<CreatePaymentOrderResult> {
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

    const payload: PublicEnrollmentCheckoutPayload = {
      version: PUBLIC_ENROLLMENT_CHECKOUT_PAYLOAD_VERSION,
      batchId: command.batchId,
      batchTimingId: command.batchTimingId,
      branchId: command.branchId,
      courseId: command.courseId,
      coinsToRedeem: Math.max(0, Math.floor(command.coinsToRedeem)),
    };

    await this.cancelUnpaidPublicEnrollment.cancelForStudent(
      student.id,
      command.userId,
    );

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
        batchId: command.batchId,
        expectedBranchId: command.branchId,
        expectedCourseId: command.courseId,
      },
    );

    const pricing = hierarchy.batch.getPricing();
    const isComplimentary =
      pricing.isFree || pricing.discountedPrice <= 0;

    if (isComplimentary) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Free courses do not require advance payment checkout.',
        400,
      );
    }

    const batchTiming = await this.resolveBatchTiming(
      command.batchId,
      command.batchTimingId,
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
      command.batchId,
    );

    const draftEnrollment = Enrollment.create({
      id: randomUUID(),
      enrollmentNumber: 'DRAFT',
      studentId: student.id,
      branchId: hierarchy.branchId,
      categoryId: hierarchy.categoryId,
      courseId: hierarchy.courseId,
      batchId: command.batchId,
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
      mode: mapCourseModeToEnrollmentMode(batchTiming.mode),
      remarks: undefined,
      isActive: false,
      createdBy: command.userId,
    });

    if (payload.coinsToRedeem > 0) {
      await this.enrollmentCoinService.validateCoinsForEnrollment(
        command.userId,
        draftEnrollment,
        payload.coinsToRedeem,
      );
    }

    const finalAmount = draftEnrollment.finalAmount;
    if (
      !isPublicOnlineAdvanceEnrollment({
        source: EnrollmentSource.PUBLIC,
        applicationType: ApplicationType.ONLINE,
        finalAmount,
      })
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'This enrollment does not require online advance payment.',
        400,
      );
    }

    const orderAmount = Math.min(
      PUBLIC_ONLINE_ADVANCE_AMOUNT,
      draftEnrollment.dueAmount,
    );

    if (orderAmount <= 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Nothing to pay for this enrollment.',
        400,
      );
    }

    const existingPending =
      await this.findReusablePendingCheckout(student.id, payload);

    if (existingPending?.gatewayOrderId) {
      this.logger.log(
        `♻️ Reusing pending checkout order ${existingPending.gatewayOrderId}`,
      );

      return new CreatePaymentOrderResult(
        existingPending.gatewayOrderId,
        existingPending.amount,
        existingPending.currency,
        this.gateway.getPublicKey(),
        existingPending.id,
        existingPending.paymentNumber.getValue(),
      );
    }

    const currency = hierarchy.batch.getPricing().currency || 'INR';

    const order = await this.gateway.createOrder({
      amount: orderAmount,
      currency,
      receipt: `CHK-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
      notes: {
        studentId: student.id,
        batchId: command.batchId,
        checkout: 'public-enrollment',
      },
    });

    const paymentNumber =
      await this.paymentDomainService.generateUniquePaymentNumber(
        this.paymentRepo,
      );

    const payment = Payment.create({
      id: randomUUID(),
      paymentNumber,
      enrollmentId: null,
      checkoutPayload: payload as unknown as Record<string, unknown>,
      studentId: student.id,
      amount: orderAmount,
      currency,
      paymentMethod: PaymentMethod.RAZORPAY,
      paymentStatus: PaymentStatus.PENDING,
      gateway: PaymentGateway.RAZORPAY,
      gatewayOrderId: order.orderId,
      createdBy: command.userId,
    });

    await this.paymentRepo.save(payment);

    this.logger.log(
      `✅ Public enrollment checkout order created: ${order.orderId}`,
    );

    return new CreatePaymentOrderResult(
      order.orderId,
      order.amount,
      order.currency,
      this.gateway.getPublicKey(),
      payment.id,
      paymentNumber,
    );
  }

  private async findReusablePendingCheckout(
    studentId: string,
    payload: PublicEnrollmentCheckoutPayload,
  ): Promise<Payment | null> {
    const pending =
      await this.paymentRepo.findPendingEnrollmentCheckoutsByStudentId(
        studentId,
      );

    return (
      pending.find((payment) =>
        this.checkoutPayloadMatches(payment.checkoutPayload, payload),
      ) ?? null
    );
  }

  private checkoutPayloadMatches(
    stored: Record<string, unknown> | null,
    expected: PublicEnrollmentCheckoutPayload,
  ): boolean {
    if (!stored) {
      return false;
    }

    return (
      stored.version === expected.version &&
      stored.batchId === expected.batchId &&
      stored.batchTimingId === expected.batchTimingId &&
      stored.branchId === expected.branchId &&
      stored.courseId === expected.courseId &&
      Number(stored.coinsToRedeem ?? 0) === expected.coinsToRedeem
    );
  }

  private async resolveBatchTiming(
    batchId: string,
    batchTimingId: string,
  ) {
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
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch timing not found.',
        404,
      );
    }

    return timing;
  }
}
