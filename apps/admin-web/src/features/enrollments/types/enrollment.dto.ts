// src/features/enrollments/types/enrollment.dto.ts

import {
  Enrollment,
} from "./enrollment.types";

import {
  EnrollmentStatus,
} from "./enrollment.enums";

export interface CreateEnrollmentRequest {
  studentId: string;
  batchId: string;
  branchId?: string;
  feeAmount: number;
  discountAmount?: number;
  admissionDate?: string;
  initialPaymentAmount?: number;
  paymentMethod?: string;
  transactionId?: string;
  initialPaymentPaidAt?: string;
  installments?: Array<{
    amount: number;
    dueDate?: string;
    paymentMethod: string;
    paymentStatus?: "PENDING" | "SUCCESS";
    transactionId?: string;
  }>;
}

export interface UpdateEnrollmentRequest {
  studentId?: string;
  batchId?: string;
  admissionDate?: string;
  joiningDate?: string;
  expectedCompletionDate?: string;
  feeAmount?: number;
  discountAmount?: number;
  paidAmount?: number;
  remarks?: string;
  status?: EnrollmentStatus;
  isActive?: boolean;
}

export interface UpdateEnrollmentStatusRequest {
  status: EnrollmentStatus;
}

export interface EnrollmentListResponse {
  success: boolean;

  message: string;

  data: {
    items: Enrollment[];

    total: number;

    skip: number;

    take: number;
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: Enrollment;
}

export interface DeleteEnrollmentResponse {
  success: boolean;
  message: string;

  data: {
    id: string;
    deleted: boolean;
    deletedAt?: string;
  };
}