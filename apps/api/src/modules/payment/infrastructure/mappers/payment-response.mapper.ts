import { Prisma } from '@prisma/client';

import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type {
  PaymentDetailView,
  PaymentEnrollmentView,
  PaymentStudentView,
  PaymentSummaryView,
} from '../../domain/repositories/payment.repository';

// Eager-load graph shared by all payment read queries.
export const paymentDetailInclude = {
  student: true,
  enrollment: { include: { course: true, batch: true } },
} satisfies Prisma.PaymentInclude;

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: typeof paymentDetailInclude;
}>;

const toNumber = (value: Prisma.Decimal): number => Number(value);

export class PaymentResponseMapper {
  static toDetail(
    record: PaymentWithRelations,
  ): PaymentDetailView {
    return {
      id: record.id,
      paymentNumber: record.paymentNumber,
      amount: toNumber(record.amount),
      currency: record.currency,
      paymentMethod: record.paymentMethod as PaymentMethod,
      paymentStatus: record.paymentStatus as PaymentStatus,
      gateway: record.gateway as PaymentGateway,
      gatewayOrderId: record.gatewayOrderId,
      gatewayPaymentId: record.gatewayPaymentId,
      transactionId: record.transactionId,
      remarks: record.remarks,
      paidAt: record.paidAt,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      enrollment: this.toEnrollment(record.enrollment),
      student: this.toStudent(record.student),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toSummary(
    record: PaymentWithRelations,
  ): PaymentSummaryView {
    return {
      id: record.id,
      paymentNumber: record.paymentNumber,
      amount: toNumber(record.amount),
      currency: record.currency,
      paymentMethod: record.paymentMethod as PaymentMethod,
      paymentStatus: record.paymentStatus as PaymentStatus,
      gateway: record.gateway as PaymentGateway,
      paidAt: record.paidAt,
      createdAt: record.createdAt,
      enrollment: {
        id: record.enrollment.id,
        enrollmentNumber: record.enrollment.enrollmentNumber,
        courseTitle: record.enrollment.course.title,
      },
      student: {
        id: record.student.id,
        studentCode: record.student.studentCode,
        firstName: record.student.firstName,
        lastName: record.student.lastName,
      },
    };
  }

  private static toEnrollment(
    enrollment: PaymentWithRelations['enrollment'],
  ): PaymentEnrollmentView {
    return {
      id: enrollment.id,
      enrollmentNumber: enrollment.enrollmentNumber,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      feeAmount: toNumber(enrollment.feeAmount),
      finalAmount: toNumber(enrollment.finalAmount),
      paidAmount: toNumber(enrollment.paidAmount),
      dueAmount: toNumber(enrollment.dueAmount),
      courseTitle: enrollment.course.title,
      batchName: enrollment.batch.name,
    };
  }

  private static toStudent(
    student: PaymentWithRelations['student'],
  ): PaymentStudentView {
    return {
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
    };
  }
}
