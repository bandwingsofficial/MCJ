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
  feeAmount: number;
  discountAmount?: number;
}

export interface UpdateEnrollmentRequest {
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