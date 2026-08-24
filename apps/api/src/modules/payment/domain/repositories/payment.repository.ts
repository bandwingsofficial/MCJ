import { Payment } from '../entities/payment.entity';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export interface PaymentListFilters {
  search?: string;
  enrollmentId?: string;
  studentId?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  gateway?: PaymentGateway;
  includeDeleted?: boolean;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// =====================
// Read models (eagerly-loaded projections for response mapping)
// =====================

export interface PaymentStudentView {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

export interface PaymentEnrollmentView {
  id: string;
  enrollmentNumber: string;
  status: string;
  paymentStatus: string;
  feeAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  courseTitle: string;
  batchName: string;
}

export interface PaymentDetailView {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gateway: PaymentGateway;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  transactionId: string | null;
  remarks: string | null;
  paidAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  enrollment: PaymentEnrollmentView;
  student: PaymentStudentView;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSummaryView {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gateway: PaymentGateway;
  paidAt: Date | null;
  createdAt: Date;
  enrollment: Pick<
    PaymentEnrollmentView,
    'id' | 'enrollmentNumber' | 'courseTitle'
  >;
  student: Pick<
    PaymentStudentView,
    'id' | 'studentCode' | 'firstName' | 'lastName'
  >;
}

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Payment | null>;
  findByPaymentNumber(
    paymentNumber: string,
    includeDeleted?: boolean,
  ): Promise<Payment | null>;
  findByGatewayOrderId(
    gatewayOrderId: string,
    includeDeleted?: boolean,
  ): Promise<Payment | null>;
  findByGatewayPaymentId(
    gatewayPaymentId: string,
    includeDeleted?: boolean,
  ): Promise<Payment | null>;
  findPendingByEnrollmentId(
    enrollmentId: string,
  ): Promise<Payment | null>;
  findDetailById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<PaymentDetailView | null>;
  findSummaries(
    filters?: PaymentListFilters,
  ): Promise<PaymentSummaryView[]>;
  count(filters?: PaymentListFilters): Promise<number>;
  deletePermanent(id: string): Promise<void>;
}
