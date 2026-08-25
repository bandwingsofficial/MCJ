import { Prisma } from '@prisma/client';

import { buildCoursePricing } from '@modules/course/domain/value-objects/course-pricing.vo';

import { EnrollmentSource } from '../../domain/enums/enrollment-source.enum';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';
import type {
  EnrollmentBatchView,
  EnrollmentBranchView,
  EnrollmentCategoryView,
  EnrollmentCourseView,
  EnrollmentDetailView,
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
  course: true,
  batch: { include: { trainers: { include: { trainer: true } } } },
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
      status: record.status as EnrollmentStatus,
      paymentStatus: record.paymentStatus as PaymentStatus,
      source: record.source as EnrollmentSource,
      feeAmount: toNumber(record.feeAmount),
      discountAmount: toNumber(record.discountAmount),
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
      status: record.status as EnrollmentStatus,
      paymentStatus: record.paymentStatus as PaymentStatus,
      source: record.source as EnrollmentSource,
      feeAmount: toNumber(record.feeAmount),
      discountAmount: toNumber(record.discountAmount),
      finalAmount: toNumber(record.finalAmount),
      paidAmount: toNumber(record.paidAmount),
      dueAmount: toNumber(record.dueAmount),
      isActive: record.isActive,
      admissionDate: record.admissionDate,
      createdAt: record.createdAt,
      student: this.toStudent(record.student),
      branch: this.toBranch(record.branch),
      course: {
        id: record.course.id,
        title: record.course.title,
        slug: record.course.slug,
      },
      batch: {
        id: record.batch.id,
        name: record.batch.name,
        code: record.batch.code,
        startDate: record.batch.startDate,
        status: record.batch.status,
      },
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
      isActive: student.isActive,
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
    const pricing = buildCoursePricing({
      originalPrice: toNumber(course.originalPrice),
      discountAmount: toNumber(course.discountAmount),
      discountedPrice: toNumber(course.discountedPrice),
      currency: course.currency,
      isFree: course.isFree,
    });

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
      pricing,
    };
  }

  private static toBatch(
    batch: EnrollmentWithRelations['batch'],
  ): EnrollmentBatchView {
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
      classroom: batch.classroom,
      meetingLink: batch.meetingLink,
      status: batch.status,
      isFeatured: batch.isFeatured,
      isActive: batch.isActive,
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
