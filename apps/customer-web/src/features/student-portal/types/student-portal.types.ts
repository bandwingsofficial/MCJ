import type { ApiResponse } from "@/src/core/types/api-response.types";

export type StudentPortalAccessReason =
  | "ACCESS_GRANTED"
  | "STUDENT_NOT_ADMITTED"
  | "ENROLLMENT_NOT_ADMITTED";

export interface StudentPortalStudent {
  id: string;

  studentCode: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  status: string;

  profileImageUrl: string | null;
}

export interface StudentPortalEnrollment {
  id: string;

  enrollmentNumber: string;

  status: string;

  paymentStatus: string;

  admissionDate: string | null;

  joiningDate: string;

  expectedCompletionDate: string;
}

export interface StudentPortalCourse {
  id: string;

  title: string;

  slug: string;

  pricing: {
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    discountedPrice: number;
    currency: string;
    isFree: boolean;
  };
}

export interface StudentPortalBatch {
  id: string;

  name: string;

  code: string;

  startDate: string;

  endDate: string;

  startTime: string;

  endTime: string;

  mode: string;

  classroom: string | null;

  meetingLink: string | null;
}

export interface StudentPortalTrainer {
  id: string;

  firstName: string;

  lastName: string;

  employeeCode: string;

  email: string;

  phone: string;

  specialization: string;
}

export interface StudentPortalPaymentSummary {
  feeAmount: number;

  discountAmount: number;

  finalAmount: number;

  paidAmount: number;

  dueAmount: number;
}

export interface StudentPortalAccess {
  allowed: boolean;

  reason: StudentPortalAccessReason;

  student?: StudentPortalStudent;

  enrollment?: StudentPortalEnrollment;

  course?: StudentPortalCourse;

  batch?: StudentPortalBatch;

  trainers?: StudentPortalTrainer[];

  paymentSummary?: StudentPortalPaymentSummary;
}

export type StudentPortalAccessResponse =
  ApiResponse<StudentPortalAccess>;