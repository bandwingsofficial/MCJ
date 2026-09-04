import { EnrollmentStatus } from '@modules/enrollment/domain/enums/enrollment-status.enum';
import { PaymentStatus } from '@modules/enrollment/domain/enums/payment-status.enum';

import { StudentPortalAccessReason } from '../../domain/enums/student-portal-access-reason.enum';

export interface StudentPortalStudentView {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  profileImageUrl: string | null;
}

export interface StudentPortalEnrollmentView {
  id: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  admissionDate: Date | null;
  joiningDate: Date | null;
  expectedCompletionDate: Date | null;
}

export interface StudentPortalCourseView {
  id: string;
  title: string;
  slug: string;
}

export interface StudentPortalBatchView {
  id: string;
  name: string;
  code: string;
  startDate: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  mode: string;
  classroom: string | null;
  meetingLink: string | null;
  pricing: {
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    discountedPrice: number;
    currency: string;
    isFree: boolean;
  };
}

export interface StudentPortalTrainerView {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  email: string | null;
  phone: string | null;
  specialization: string | null;
}

export interface StudentPortalPaymentSummaryView {
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface StudentPortalAccessResult {
  allowed: boolean;
  reason: StudentPortalAccessReason;
  student: StudentPortalStudentView;
  enrollment: StudentPortalEnrollmentView;
  course: StudentPortalCourseView;
  batch: StudentPortalBatchView;
  trainers: StudentPortalTrainerView[];
  paymentSummary: StudentPortalPaymentSummaryView;
}
