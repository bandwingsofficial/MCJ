import {
  Enrollment as PrismaEnrollment,
  Prisma,
} from '@prisma/client';

import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import { toMoneyNumber } from './enrollment-money.utils';

const toNumber = toMoneyNumber;

export class EnrollmentMapper {
  static toDomain(record: PrismaEnrollment): Enrollment {
    return Enrollment.reconstitute({
      id: record.id,
      enrollmentNumber: record.enrollmentNumber,
      studentId: record.studentId,
      branchId: record.branchId,
      categoryId: record.categoryId,
      courseId: record.courseId,
      batchId: record.batchId,
      admissionDate: record.admissionDate,
      joiningDate: record.joiningDate,
      expectedCompletionDate: record.expectedCompletionDate,
      feeAmount: toNumber(record.feeAmount),
      discountAmount: toNumber(record.discountAmount),
      finalAmount: toNumber(record.finalAmount),
      paidAmount: toNumber(record.paidAmount),
      dueAmount: toNumber(record.dueAmount),
      paymentStatus: record.paymentStatus as PaymentStatus,
      status: record.status as EnrollmentStatus,
      source: record.source as EnrollmentSource,
      remarks: record.remarks,
      isActive: record.isActive,
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
    enrollment: Enrollment,
  ): Prisma.EnrollmentUncheckedCreateInput {
    return {
      id: enrollment.id,
      enrollmentNumber: enrollment.enrollmentNumber.getValue(),
      studentId: enrollment.studentId,
      branchId: enrollment.branchId,
      categoryId: enrollment.categoryId,
      courseId: enrollment.courseId,
      batchId: enrollment.batchId,
      admissionDate: enrollment.admissionDate,
      joiningDate: enrollment.joiningDate,
      expectedCompletionDate: enrollment.expectedCompletionDate,
      feeAmount: new Prisma.Decimal(enrollment.feeAmount),
      discountAmount: new Prisma.Decimal(enrollment.discountAmount),
      finalAmount: new Prisma.Decimal(enrollment.finalAmount),
      paidAmount: new Prisma.Decimal(enrollment.paidAmount),
      dueAmount: new Prisma.Decimal(enrollment.dueAmount),
      paymentStatus: enrollment.paymentStatus,
      status: enrollment.status,
      source: enrollment.source,
      remarks: enrollment.remarks,
      isActive: enrollment.isActive,
      createdBy: enrollment.createdBy,
      updatedBy: enrollment.updatedBy,
      isDeleted: enrollment.isDeleted,
      deletedAt: enrollment.deletedAt,
      deletedBy: enrollment.deletedBy,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }
}
