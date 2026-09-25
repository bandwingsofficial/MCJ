import type { ApiResponse } from "@/src/core/types/api-response.types";

export type ApplicationType = "OFFLINE" | "ONLINE";

export type EnrollmentMode = "OFFLINE" | "ONLINE" | "SELF_PACED";

export type EnrollmentStatus =
  | "PENDING"
  | "PENDING_APPROVAL"
  | "ADVANCED"
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
  batchTimingId: string;
  branchId?: string;
  courseId?: string;
}

export interface EnrollmentPayment {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  gateway: string;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface BatchTimingSummary {
  id: string;
  name: string;
  mode: string;
  daysOfWeek: string[];
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  isActive: boolean;
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
  updatedAt?: string | null;
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
  updatedAt?: string | null;
  status: string;
  averageRating: number;
  totalReviews: number;
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
  pricing?: {
    originalPrice: number;
    discountAmount: number;
    discountPercent?: number;
    discountedPrice: number;
    currency: string;
    isFree: boolean;
  } | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
}

export interface Enrollment {
  id: string;
  enrollmentNumber: string;
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  source: string;
  applicationType: ApplicationType;
  mode: EnrollmentMode;

  feeAmount: number;
  discountAmount: number;
  coinDiscountAmount?: number;
  redeemedCoins?: number;
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
  batchTimingId?: string | null;
  batchTiming?: BatchTimingSummary | null;
  payments?: EnrollmentPayment[];

  createdAt: string;
  updatedAt: string;
}

export type CreateEnrollmentResponse =
  ApiResponse<Enrollment>;

export type MyEnrollmentsResponse =
  ApiResponse<Enrollment[]>;