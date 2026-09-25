import { Prisma } from '@prisma/client';

import { buildBatchPricing } from '@modules/batch/domain/value-objects/batch-pricing.vo';

import { ApplicationType } from '../../domain/enums/application-type.enum';
import { EnrollmentMode } from '../../domain/enums/enrollment-mode.enum';
import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type {
  EnrollmentBatchView,
  EnrollmentBatchTimingView,
  EnrollmentBranchView,
  EnrollmentCategoryView,
  EnrollmentCourseView,
  EnrollmentDetailView,
  EnrollmentPaymentView,
  EnrollmentStudentView,
  EnrollmentSummaryView,
  EnrollmentTrainerView,
} from '../../domain/repositories/enrollment.repository';
import { toMoneyNumber } from './enrollment-money.utils';

// Eager-load graph shared by all enrollment read queries.
export const enrollmentDetailInclude = {
  student: true,
  branch: true,
  category: true,
  course: {
    include: {
      trainers: { include: { trainer: true } },
    },
  },
  batchTiming: true,
  batch: { include: { trainers: { include: { trainer: true } } } },
  payments: {
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' as const },
  },
} satisfies Prisma.EnrollmentInclude;

type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentDetailInclude;
}>;

const toNumber = toMoneyNumber;

export class EnrollmentResponseMapper {
  static toDetail(
    record: EnrollmentWithRelations,
  ): EnrollmentDetailView {
    return {
      id: record.id,
      enrollmentNumber: record.enrollmentNumber,
      studentId: record.studentId,
      branchId: record.branchId,
      categoryId: record.categoryId,
      courseId: record.courseId,
      batchId: record.batchId,
      status: record.status as EnrollmentStatus,
      paymentStatus: record.paymentStatus as PaymentStatus,
      source: record.source as EnrollmentSource,
      applicationType: record.applicationType as ApplicationType,
      mode: record.mode as EnrollmentMode,
      feeAmount: toNumber(record.feeAmount),
      discountAmount: toNumber(record.discountAmount),
      coinDiscountAmount: toNumber(record.coinDiscountAmount),
      redeemedCoins: record.redeemedCoins,
      finalAmount: toNumber(record.finalAmount),
      paidAmount: toNumber(record.paidAmount),
      dueAmount: toNumber(record.dueAmount),
      admissionDate: record.admissionDate,
      joiningDate: record.joiningDate,
      expectedCompletionDate: record.expectedCompletionDate,
      remarks: record.remarks,
      rejectionReason: record.rejectionReason,
      isActive: record.isActive,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      student: this.toStudent(record.student),
      branch: this.toBranch(record.branch),
      category: this.toCategory(record.category),
      course: this.toCourse(record.course),
      batch: this.toBatch(record.batch),
      batchTimingId: record.batchTimingId,
      batchTiming: record.batchTiming
        ? this.toBatchTiming(record.batchTiming)
        : null,
      payments: (record.payments ?? []).map((payment) =>
        this.toPayment(payment),
      ),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toSummary(
    record: EnrollmentWithRelations,
  ): EnrollmentSummaryView {
    return {
      id: record.id,
      enrollmentNumber: record.enrollmentNumber,
      studentId: record.studentId,
      branchId: record.branchId,
      categoryId: record.categoryId,
      courseId: record.courseId,
      batchId: record.batchId,
      status: record.status as EnrollmentStatus,
      paymentStatus: record.paymentStatus as PaymentStatus,
      source: record.source as EnrollmentSource,
      applicationType: record.applicationType as ApplicationType,
      mode: record.mode as EnrollmentMode,
      feeAmount: toNumber(record.feeAmount),
      discountAmount: toNumber(record.discountAmount),
      coinDiscountAmount: toNumber(record.coinDiscountAmount),
      redeemedCoins: record.redeemedCoins,
      finalAmount: toNumber(record.finalAmount),
      paidAmount: toNumber(record.paidAmount),
      dueAmount: toNumber(record.dueAmount),
      isActive: record.isActive,
      admissionDate: record.admissionDate,
      createdAt: record.createdAt,
      student: this.toStudent(record.student),
      branch: this.toBranch(record.branch),
      category: this.toCategory(record.category),
      course: {
        id: record.course.id,
        title: record.course.title,
        slug: record.course.slug,
      },
      batch: this.toBatch(record.batch),
      batchTimingId: record.batchTimingId,
      batchTiming: record.batchTiming
        ? this.toBatchTiming(record.batchTiming)
        : null,
    };
  }

  private static toPayment(
    payment: EnrollmentWithRelations['payments'][number],
  ): EnrollmentPaymentView {
    return {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      amount: toNumber(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      gateway: payment.gateway,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPaymentId: payment.gatewayPaymentId,
      paidAt: payment.paidAt,
      createdAt: payment.createdAt,
    };
  }

  private static toStudent(
    student: EnrollmentWithRelations['student'],
  ): EnrollmentStudentView {
    return {
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      qualification: student.qualification,
      profileImageUrl: student.profileImageUrl,
      status: student.status,
      applicationType: student.applicationType,
      isActive: student.isActive,
      updatedAt: student.updatedAt,
    };
  }

  private static toBranch(
    branch: EnrollmentWithRelations['branch'],
  ): EnrollmentBranchView {
    return {
      id: branch.id,
      branchName: branch.branchName,
      branchCode: branch.branchCode,
    };
  }

  private static toCategory(
    category: EnrollmentWithRelations['category'],
  ): EnrollmentCategoryView {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  }

  private static toCourse(
    course: EnrollmentWithRelations['course'],
  ): EnrollmentCourseView {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      tagline: course.tagline,
      shortDescription: course.shortDescription,
      duration: course.duration,
      durationType: course.durationType,
      level: course.level,
      language: course.language,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      averageRating: course.averageRating,
      totalReviews: course.totalReviews,
      updatedAt: course.updatedAt,
      trainers: course.trainers.map((link) => this.toTrainer(link.trainer)),
    };
  }

  private static toBatchTiming(
    timing: NonNullable<EnrollmentWithRelations['batchTiming']>,
  ): EnrollmentBatchTimingView {
    return {
      id: timing.id,
      name: timing.name,
      mode: timing.mode,
      daysOfWeek: timing.daysOfWeek,
      startDate: timing.startDate,
      endDate: timing.endDate,
      startTime: timing.startTime,
      endTime: timing.endTime,
      capacity: timing.capacity,
      enrolledCount: timing.enrolledCount,
      status: timing.status,
      isActive: timing.isActive,
    };
  }

  private static toBatch(
    batch: EnrollmentWithRelations['batch'],
  ): EnrollmentBatchView {
    const pricing = buildBatchPricing({
      originalPrice: toNumber(batch.originalPrice),
      discountAmount: toNumber(batch.discountAmount),
      discountedPrice: toNumber(batch.discountedPrice),
      currency: batch.currency,
      isFree: batch.isFree,
    });

    return {
      id: batch.id,
      name: batch.name,
      code: batch.code,
      slug: batch.slug,
      description: batch.description,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      daysOfWeek: batch.daysOfWeek,
      capacity: batch.capacity,
      enrolledCount: batch.enrolledCount,
      mode: batch.mode,
      durationValue: batch.durationValue,
      durationType: batch.durationType,
      classroom: batch.classroom,
      meetingLink: batch.meetingLink,
      status: batch.status,
      isFeatured: batch.isFeatured,
      isActive: batch.isActive,
      pricing,
      trainers: batch.trainers.map((bt) => this.toTrainer(bt.trainer)),
    };
  }

  private static toTrainer(
    trainer: EnrollmentWithRelations['batch']['trainers'][number]['trainer'],
  ): EnrollmentTrainerView {
    return {
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      employeeCode: trainer.employeeCode,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
    };
  }
}
