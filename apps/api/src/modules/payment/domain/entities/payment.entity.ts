import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentAlreadyProcessedException } from '../errors/payment-business.exception';
import { Amount } from '../value-objects/amount.vo';
import { PaymentNumber } from '../value-objects/payment-number.vo';

export class Payment {
  private constructor(
    public readonly id: string,
    public paymentNumber: PaymentNumber,
    public readonly enrollmentId: string,
    public readonly studentId: string,
    public amount: number,
    public currency: string,
    public paymentMethod: PaymentMethod,
    public paymentStatus: PaymentStatus,
    public gateway: PaymentGateway,
    public gatewayOrderId: string | null,
    public gatewayPaymentId: string | null,
    public gatewaySignature: string | null,
    public transactionId: string | null,
    public remarks: string | null,
    public paidAt: Date | null,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: PaymentCreateParams): Payment {
    const amount = Amount.create(params.amount).getValue();

    return new Payment(
      params.id,
      PaymentNumber.create(params.paymentNumber),
      params.enrollmentId,
      params.studentId,
      amount,
      params.currency?.trim() || 'INR',
      params.paymentMethod,
      params.paymentStatus ?? PaymentStatus.PENDING,
      params.gateway ?? PaymentGateway.MANUAL,
      params.gatewayOrderId ?? null,
      params.gatewayPaymentId ?? null,
      params.gatewaySignature ?? null,
      params.transactionId ?? null,
      sanitizeText(params.remarks, 4000),
      params.paidAt ?? null,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: PaymentReconstituteParams): Payment {
    return new Payment(
      params.id,
      PaymentNumber.create(params.paymentNumber),
      params.enrollmentId,
      params.studentId,
      params.amount,
      params.currency,
      params.paymentMethod,
      params.paymentStatus,
      params.gateway,
      params.gatewayOrderId,
      params.gatewayPaymentId,
      params.gatewaySignature,
      params.transactionId,
      params.remarks,
      params.paidAt,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  isSuccessful(): boolean {
    return this.paymentStatus === PaymentStatus.SUCCESS;
  }

  isPending(): boolean {
    return this.paymentStatus === PaymentStatus.PENDING;
  }

  // Marks a gateway payment as captured. Idempotent guard: a payment that is no
  // longer pending cannot be re-processed (prevents duplicate side effects).
  markSuccess(params: MarkSuccessParams) {
    if (!this.isPending()) {
      throw new PaymentAlreadyProcessedException();
    }

    this.paymentStatus = PaymentStatus.SUCCESS;
    this.gatewayPaymentId =
      params.gatewayPaymentId ?? this.gatewayPaymentId;
    this.gatewaySignature =
      params.gatewaySignature ?? this.gatewaySignature;
    this.transactionId =
      params.transactionId ?? this.transactionId ?? params.gatewayPaymentId ?? null;
    this.paidAt = params.paidAt ?? new Date();
    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  markFailed(updatedBy?: string | null) {
    if (!this.isPending()) {
      throw new PaymentAlreadyProcessedException();
    }

    this.paymentStatus = PaymentStatus.FAILED;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  markRefunded(updatedBy?: string | null) {
    this.paymentStatus = PaymentStatus.REFUNDED;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  update(params: PaymentUpdateParams) {
    if (params.remarks !== undefined)
      this.remarks = sanitizeText(params.remarks, 4000);
    if (params.transactionId !== undefined)
      this.transactionId = params.transactionId;
    if (params.paidAt !== undefined) this.paidAt = params.paidAt;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  attachOrder(gatewayOrderId: string, updatedBy?: string | null) {
    this.gatewayOrderId = gatewayOrderId;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

interface MarkSuccessParams {
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  transactionId?: string | null;
  paidAt?: Date | null;
  updatedBy?: string | null;
}

export interface PaymentCreateParams {
  id: string;
  paymentNumber: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  gateway?: PaymentGateway;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  transactionId?: string | null;
  remarks?: string | null;
  paidAt?: Date | null;
  createdBy?: string | null;
}

export interface PaymentUpdateParams {
  remarks?: string | null;
  transactionId?: string | null;
  paidAt?: Date | null;
  updatedBy?: string | null;
}

export interface PaymentReconstituteParams {
  id: string;
  paymentNumber: string;
  enrollmentId: string;
  studentId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  gateway: PaymentGateway;
  gatewayOrderId: string | null;
  gatewayPaymentId: string | null;
  gatewaySignature: string | null;
  transactionId: string | null;
  remarks: string | null;
  paidAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeText = (value?: string | null, maxLength = 1000) => {
  const normalized = value?.trim() || null;
  return normalized ? normalized.slice(0, maxLength) : null;
};
