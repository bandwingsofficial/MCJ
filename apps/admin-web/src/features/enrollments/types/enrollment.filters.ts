// src/features/enrollments/types/enrollment.filters.ts

import type {
  AdminEnrollmentListTab,
  StudentManageEnrollmentTab,
} from "@mcj/shared-constants";

import {
  EnrollmentStatus,
  PaymentStatus,
  ApplicationType,
  SortOrder,
} from "./enrollment.enums";

export interface EnrollmentFilters {
  search?: string;

  studentId?: string;

  status?: EnrollmentStatus;

  /** Comma-separated statuses (e.g. ADMITTED,CANCELLED). */
  statusIn?: string;

  paymentStatus?: PaymentStatus;

  applicationType?: ApplicationType;

  branchId?: string;

  courseId?: string;

  batchId?: string;

  batchTimingId?: string;

  isActive?: boolean;

  currentOnly?: boolean;

  includeDeleted?: boolean;

  skip: number;

  take: number;

  sortBy?: string;

  sortOrder?: SortOrder;

  /** Admin list tab: active | completed | cancelled */
  adminTab?: AdminEnrollmentListTab;

  studentEnrollmentTab?: StudentManageEnrollmentTab;
}
