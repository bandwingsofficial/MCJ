// src/features/enrollments/types/enrollment.filters.ts

import {
  EnrollmentStatus,
  PaymentStatus,
  SortOrder,
} from "./enrollment.enums";

export interface EnrollmentFilters {
  search?: string;

  studentId?: string;

  status?: EnrollmentStatus;

  paymentStatus?: PaymentStatus;

  branchId?: string;

  courseId?: string;

  batchId?: string;

  isActive?: boolean;

  currentOnly?: boolean;

  includeDeleted?: boolean;

  skip: number;

  take: number;

  sortBy?: string;

  sortOrder?: SortOrder;
}