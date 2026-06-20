// src/features/enrollments/types/enrollment.filters.ts

import {
  EnrollmentStatus,
  PaymentStatus,
  SortOrder,
} from "./enrollment.enums";

export interface EnrollmentFilters {
  search?: string;

  status?: EnrollmentStatus;

  paymentStatus?: PaymentStatus;

  branchId?: string;

  courseId?: string;

  batchId?: string;

  isActive?: boolean;

  skip: number;

  take: number;

  sortBy?: string;

  sortOrder?: SortOrder;
}