// src/features/enrollments/types/enrollment.enums.ts

/**
 * Enrollment Status
 */
export enum EnrollmentStatus {
  PENDING = "PENDING",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  LEAD = "LEAD",
  ENROLLED = "ENROLLED",
  JOINED = "JOINED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  PLACED = "PLACED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
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
 * Application Type — where the application originated
 */
export enum ApplicationType {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

/**
 * Enrollment Mode — how the student takes the course
 */
export enum EnrollmentMode {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
  SELF_PACED_RECORDED = "SELF_PACED_RECORDED",
}

/**
 * Sort Order
 */
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
