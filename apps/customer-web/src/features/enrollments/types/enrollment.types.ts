import type { ApiResponse } from "@/src/core/types/api-response.types";

export type EnrollmentStatus =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "ADMITTED"
  | "ACTIVE"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "REFUNDED";

export interface CreateEnrollmentRequest {
  batchId: string;
  remarks?: string;
}

export interface StudentSummary {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  qualification: string;
  profileImageUrl: string | null;
  status: string;
  isActive: boolean;
}

export interface BranchSummary {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  duration: number;
  durationType: string;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  status: string;
  averageRating: number;
  totalReviews: number;
  pricing: {
    originalPrice: number;
    discountAmount: number;
    discountPercent: number;
    discountedPrice: number;
    currency: string;
    isFree: boolean;
  };
}

export interface TrainerSummary {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
  phone: string;
  specialization: string;
}

export interface BatchSummary {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: string[];
  capacity: number;
  enrolledCount: number;
  mode: string;
  classroom: string;
  meetingLink: string | null;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  trainers: TrainerSummary[];
}

export interface Enrollment {
  id: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  source: string;

  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;

  admissionDate: string | null;
  joiningDate: string;
  expectedCompletionDate: string;

  remarks: string | null;
  rejectionReason: string | null;

  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;

  student: StudentSummary;
  branch: BranchSummary;
  category: CategorySummary;
  course: CourseSummary;
  batch: BatchSummary;

  createdAt: string;
  updatedAt: string;
}

export type CreateEnrollmentResponse =
  ApiResponse<Enrollment>;

export type MyEnrollmentsResponse =
  ApiResponse<Enrollment[]>;