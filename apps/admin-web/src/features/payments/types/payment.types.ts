export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "NET_BANKING"
  | "CHEQUE"
  | "ONLINE"
  | "OTHER";

export type PaymentRecordStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export type PaymentGateway = "RAZORPAY" | "MANUAL" | "OTHER";

export interface PaymentEnrollmentSummary {
  id: string;
  enrollmentNumber: string;
  courseTitle: string;
}

export interface PaymentStudentSummary {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
}

export interface PaymentSummary {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentRecordStatus;
  gateway: PaymentGateway;
  paidAt: string | null;
  createdAt: string;
  enrollment: PaymentEnrollmentSummary;
  student: PaymentStudentSummary;
}

export interface PaymentListResponse {
  success: boolean;
  message: string;
  data: {
    items: PaymentSummary[];
    total: number;
    skip: number;
    take: number;
  };
}

export interface PaymentFilters {
  search?: string;
  studentId?: string;
  enrollmentId?: string;
  paymentStatus?: PaymentRecordStatus;
  paymentMethod?: PaymentMethod;
  gateway?: PaymentGateway;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
