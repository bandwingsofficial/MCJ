import type { ApiResponse } from "@/src/core/types/api-response.types";

export type PaymentMethod =
  | "RAZORPAY";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentGateway =
  | "RAZORPAY";

export interface CreatePaymentOrderRequest {
  enrollmentId: string;
}

export interface CreatePaymentOrderResponse {
  orderId: string;

  amount: number;

  currency: string;

  keyId: string;

  paymentId: string;

  paymentNumber: string;
}

export interface VerifyPaymentRequest {
  enrollmentId: string;

  razorpayOrderId: string;

  razorpayPaymentId: string;

  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;

  message: string;
}

export interface PaymentEnrollmentSummary {
  id: string;

  enrollmentNumber: string;

  courseTitle: string;
}

export interface PaymentStudentSummary {
  id: string;

  studentCode: string;

  firstName: string;

  lastName: string;
}

export interface Payment {
  id: string;

  paymentNumber: string;

  amount: number;

  currency: string;

  paymentMethod: PaymentMethod;

  paymentStatus: PaymentStatus;

  gateway: PaymentGateway;

  paidAt: string | null;

  createdAt: string;

  enrollment: PaymentEnrollmentSummary;

  student: PaymentStudentSummary;
}

export interface PaymentsList {
  items: Payment[];

  total: number;

  skip: number;

  take: number;
}

export type CreatePaymentOrderApiResponse =
  ApiResponse<CreatePaymentOrderResponse>;

export type VerifyPaymentApiResponse =
  ApiResponse<VerifyPaymentResponse>;

export type PaymentsApiResponse =
  ApiResponse<PaymentsList>;