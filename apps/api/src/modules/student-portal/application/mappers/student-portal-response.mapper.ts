import type {
  EnrollmentBatchView,
  EnrollmentCourseView,
  EnrollmentDetailView,
  EnrollmentStudentView,
  EnrollmentTrainerView,
} from '@modules/enrollment/domain/repositories/enrollment.repository';

import { StudentPortalAccessReason } from '../../domain/enums/student-portal-access-reason.enum';
import type {
  StudentPortalAccessResult,
  StudentPortalBatchView,
  StudentPortalCourseView,
  StudentPortalEnrollmentView,
  StudentPortalPaymentSummaryView,
  StudentPortalStudentView,
  StudentPortalTrainerView,
} from '../get-student-portal-access/get-student-portal-access.result';

// Projects the eagerly-loaded EnrollmentDetailView into the single portal
// access payload the learning frontend consumes.
export class StudentPortalResponseMapper {
  static toAccessResult(
    enrollment: EnrollmentDetailView,
  ): StudentPortalAccessResult {
    return {
      allowed: true,
      reason: StudentPortalAccessReason.ACCESS_GRANTED,
      student: this.toStudent(enrollment.student),
      enrollment: this.toEnrollment(enrollment),
      course: this.toCourse(enrollment.course),
      batch: this.toBatch(enrollment.batch),
      trainers: enrollment.batch.trainers.map((trainer) =>
        this.toTrainer(trainer),
      ),
      paymentSummary: this.toPaymentSummary(enrollment),
    };
  }

  private static toStudent(
    student: EnrollmentStudentView,
  ): StudentPortalStudentView {
    return {
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      status: student.status,
      profileImageUrl: student.profileImageUrl,
    };
  }

  private static toEnrollment(
    enrollment: EnrollmentDetailView,
  ): StudentPortalEnrollmentView {
    return {
      id: enrollment.id,
      enrollmentNumber: enrollment.enrollmentNumber,
      status: enrollment.status,
      paymentStatus: enrollment.paymentStatus,
      admissionDate: enrollment.admissionDate,
      joiningDate: enrollment.joiningDate,
      expectedCompletionDate: enrollment.expectedCompletionDate,
    };
  }

  private static toCourse(
    course: EnrollmentCourseView,
  ): StudentPortalCourseView {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
    };
  }

  private static toBatch(
    batch: EnrollmentBatchView,
  ): StudentPortalBatchView {
    return {
      id: batch.id,
      name: batch.name,
      code: batch.code,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      mode: batch.mode,
      classroom: batch.classroom,
      meetingLink: batch.meetingLink,
      pricing: batch.pricing,
    };
  }

  private static toTrainer(
    trainer: EnrollmentTrainerView,
  ): StudentPortalTrainerView {
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

  private static toPaymentSummary(
    enrollment: EnrollmentDetailView,
  ): StudentPortalPaymentSummaryView {
    return {
      feeAmount: enrollment.feeAmount,
      discountAmount: enrollment.discountAmount,
      finalAmount: enrollment.finalAmount,
      paidAmount: enrollment.paidAmount,
      dueAmount: enrollment.dueAmount,
    };
  }
}
