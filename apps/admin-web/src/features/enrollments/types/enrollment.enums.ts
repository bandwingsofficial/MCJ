// src/features/enrollments/types/enrollment.enums.ts

/**
 * Enrollment Status
 */
export enum EnrollmentStatus {
  PENDING = "PENDING",
  ADMITTED = "ADMITTED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DROPPED = "DROPPED",
}

/**
 * Payment Status
 */
export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
}

/**
 * Enrollment Source
 */
export enum EnrollmentSource {
  ADMIN = "ADMIN",
  PUBLIC = "PUBLIC",
}

/**
 * Sort Order
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}