import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AdminOrBranchRoleGuard } from '@common/guards/admin-or-branch-role.guard';
import { JwtOrBranchJwtAuthGuard } from '@common/guards/jwt-or-branch-jwt-auth.guard';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { BATCH_TOKENS } from '../batch/batch.tokens';
import { BatchModule } from '../batch/batch.module';
import type { BatchRepository } from '../batch/domain/repositories/batch.repository';
import { BranchUserModule } from '../branch-user/branch-user.module';
import { ENROLLMENT_TOKENS } from '../enrollment/enrollment.tokens';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { EnrollmentSideEffectsService } from '../enrollment/application/shared/enrollment-side-effects.service';
import type { EnrollmentRepository } from '../enrollment/domain/repositories/enrollment.repository';
import { STUDENT_TOKENS } from '../student/student.tokens';
import { StudentModule } from '../student/student.module';
import type { StudentRepository } from '../student/domain/repositories/student.repository';

import { PAYMENT_TOKENS } from './payment.tokens';
import { CreateManualPaymentHandler } from './application/create-manual-payment/create-manual-payment.handler';
import { CreatePaymentOrderHandler } from './application/create-payment-order/create-payment-order.handler';
import { GetMyPaymentHandler } from './application/get-my-payment/get-my-payment.handler';
import { GetMyPaymentsHandler } from './application/get-my-payments/get-my-payments.handler';
import { GetPaymentHandler } from './application/get-payment/get-payment.handler';
import { HandlePaymentWebhookHandler } from './application/handle-payment-webhook/handle-payment-webhook.handler';
import { ListPaymentsHandler } from './application/list-payments/list-payments.handler';
import { PaymentEnrollmentSyncService } from './application/shared/payment-enrollment-sync.service';
import { UpdatePaymentHandler } from './application/update-payment/update-payment.handler';
import { VerifyPaymentHandler } from './application/verify-payment/verify-payment.handler';
import type { PaymentRepository } from './domain/repositories/payment.repository';
import type { PaymentGatewayPort } from './domain/services/payment-gateway.port';
import { PaymentDomainService } from './domain/services/payment-domain.service';
import { RazorpayGatewayService } from './infrastructure/gateways/razorpay-gateway.service';
import { PrismaPaymentRepository } from './infrastructure/repositories/prisma-payment.repository';
import { AdminPaymentController } from './presentation/controllers/admin-payment.controller';
import { PublicPaymentController } from './presentation/controllers/public-payment.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchUserModule,
    forwardRef(() => EnrollmentModule),
    StudentModule,
    BatchModule,
  ],

  controllers: [AdminPaymentController, PublicPaymentController],

  providers: [
    PaymentDomainService,
    SuperAdminGuard,
    JwtOrBranchJwtAuthGuard,
    AdminOrBranchRoleGuard,

    {
      provide: PAYMENT_TOKENS.PAYMENT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaPaymentRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: PAYMENT_TOKENS.PAYMENT_GATEWAY,
      useFactory: (config: ConfigService) =>
        new RazorpayGatewayService(config),
      inject: [ConfigService],
    },

    {
      provide: PaymentEnrollmentSyncService,
      useFactory: (enrollmentRepo: EnrollmentRepository) =>
        new PaymentEnrollmentSyncService(enrollmentRepo),
      inject: [ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY],
    },

    {
      provide: CreatePaymentOrderHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        enrollmentRepo: EnrollmentRepository,
        studentRepo: StudentRepository,
        gateway: PaymentGatewayPort,
        domainService: PaymentDomainService,
      ) =>
        new CreatePaymentOrderHandler(
          paymentRepo,
          enrollmentRepo,
          studentRepo,
          gateway,
          domainService,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        PAYMENT_TOKENS.PAYMENT_GATEWAY,
        PaymentDomainService,
      ],
    },

    {
      provide: VerifyPaymentHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        studentRepo: StudentRepository,
        gateway: PaymentGatewayPort,
        domainService: PaymentDomainService,
        enrollmentSync: PaymentEnrollmentSyncService,
      ) =>
        new VerifyPaymentHandler(
          paymentRepo,
          studentRepo,
          gateway,
          domainService,
          enrollmentSync,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        PAYMENT_TOKENS.PAYMENT_GATEWAY,
        PaymentDomainService,
        PaymentEnrollmentSyncService,
      ],
    },

    {
      provide: HandlePaymentWebhookHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        gateway: PaymentGatewayPort,
        enrollmentSync: PaymentEnrollmentSyncService,
      ) =>
        new HandlePaymentWebhookHandler(
          paymentRepo,
          gateway,
          enrollmentSync,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        PAYMENT_TOKENS.PAYMENT_GATEWAY,
        PaymentEnrollmentSyncService,
      ],
    },

    {
      provide: GetMyPaymentsHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        studentRepo: StudentRepository,
      ) => new GetMyPaymentsHandler(paymentRepo, studentRepo),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
      ],
    },

    {
      provide: GetMyPaymentHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        studentRepo: StudentRepository,
        domainService: PaymentDomainService,
      ) =>
        new GetMyPaymentHandler(
          paymentRepo,
          studentRepo,
          domainService,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        PaymentDomainService,
      ],
    },

    {
      provide: CreateManualPaymentHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        enrollmentRepo: EnrollmentRepository,
        domainService: PaymentDomainService,
        enrollmentSync: PaymentEnrollmentSyncService,
      ) =>
        new CreateManualPaymentHandler(
          paymentRepo,
          enrollmentRepo,
          domainService,
          enrollmentSync,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY,
        PaymentDomainService,
        PaymentEnrollmentSyncService,
      ],
    },

    {
      provide: ListPaymentsHandler,
      useFactory: (paymentRepo: PaymentRepository) =>
        new ListPaymentsHandler(paymentRepo),
      inject: [PAYMENT_TOKENS.PAYMENT_REPOSITORY],
    },

    {
      provide: GetPaymentHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        domainService: PaymentDomainService,
      ) => new GetPaymentHandler(paymentRepo, domainService),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        PaymentDomainService,
      ],
    },

    {
      provide: UpdatePaymentHandler,
      useFactory: (
        paymentRepo: PaymentRepository,
        domainService: PaymentDomainService,
        enrollmentSync: PaymentEnrollmentSyncService,
      ) =>
        new UpdatePaymentHandler(
          paymentRepo,
          domainService,
          enrollmentSync,
        ),
      inject: [
        PAYMENT_TOKENS.PAYMENT_REPOSITORY,
        PaymentDomainService,
        PaymentEnrollmentSyncService,
      ],
    },
  ],

  exports: [
    PAYMENT_TOKENS.PAYMENT_REPOSITORY,
    PaymentDomainService,
    PaymentEnrollmentSyncService,
  ],
})
export class PaymentModule {}
