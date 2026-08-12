import {
  Payment as PrismaPayment,
  Prisma,
} from '@prisma/client';

import { Payment } from '../../domain/entities/payment.entity';
import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

const toNumber = (value: Prisma.Decimal): number => Number(value);

export class PaymentMapper {
  static toDomain(record: PrismaPayment): Payment {
    return Payment.reconstitute({
      id: record.id,
      paymentNumber: record.paymentNumber,
      enrollmentId: record.enrollmentId,
      studentId: record.studentId,
      amount: toNumber(record.amount),
      currency: record.currency,
      paymentMethod: record.paymentMethod as PaymentMethod,
      paymentStatus: record.paymentStatus as PaymentStatus,
      gateway: record.gateway as PaymentGateway,
      gatewayOrderId: record.gatewayOrderId,
      gatewayPaymentId: record.gatewayPaymentId,
      gatewaySignature: record.gatewaySignature,
      transactionId: record.transactionId,
      remarks: record.remarks,
      paidAt: record.paidAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    payment: Payment,
  ): Prisma.PaymentUncheckedCreateInput {
    return {
      id: payment.id,
      paymentNumber: payment.paymentNumber.getValue(),
      enrollmentId: payment.enrollmentId,
      studentId: payment.studentId,
      amount: new Prisma.Decimal(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      gateway: payment.gateway,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPaymentId: payment.gatewayPaymentId,
      gatewaySignature: payment.gatewaySignature,
      transactionId: payment.transactionId,
      remarks: payment.remarks,
      paidAt: payment.paidAt,
      createdBy: payment.createdBy,
      updatedBy: payment.updatedBy,
      isDeleted: payment.isDeleted,
      deletedAt: payment.deletedAt,
      deletedBy: payment.deletedBy,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
