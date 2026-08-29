import { EnrollmentSource } from '../enums/enrollment-source.enum';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import {
  InvalidDiscountException,
  InvalidPaymentAmountException,
} from '../errors/enrollment-business.exception';
import { EnrollmentNumber } from '../value-objects/enrollment-number.vo';
import { Money } from '../value-objects/money.vo';

export class Enrollment {
  private constructor(
    public readonly id: string,
    public enrollmentNumber: EnrollmentNumber,
    public studentId: string,
    public branchId: string,
    public categoryId: string,
    public courseId: string,
    public batchId: string,
    public admissionDate: Date | null,
    public joiningDate: Date | null,
    public expectedCompletionDate: Date | null,
    public feeAmount: number,
    public discountAmount: number,
    public finalAmount: number,
    public paidAmount: number,
    public dueAmount: number,
    public paymentStatus: PaymentStatus,
    public status: EnrollmentStatus,
    public source: EnrollmentSource,
    public remarks: string | null,
    public rejectionReason: string | null,
    public isActive: boolean,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: EnrollmentCreateParams): Enrollment {
    const feeAmount = Money.create(params.feeAmount).getValue();
    const discountAmount = Money.create(
      params.discountAmount ?? 0,
    ).getValue();
    const paidAmount = Money.create(params.paidAmount).getValue();

    const enrollment = new Enrollment(
      params.id,
      EnrollmentNumber.create(params.enrollmentNumber),
      params.studentId,
      params.branchId,
      params.categoryId,
      params.courseId,
      params.batchId,
      params.admissionDate ?? null,
      params.joiningDate ?? null,
      params.expectedCompletionDate ?? null,
      feeAmount,
      discountAmount,
      0,
      paidAmount,
      0,
      PaymentStatus.UNPAID,
      params.status ?? EnrollmentStatus.PENDING,
      params.source ?? EnrollmentSource.ADMIN,
      sanitizeText(params.remarks, 4000),
      null,
      params.isActive ?? true,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );

    enrollment.recalculateFinancials();

    return enrollment;
  }

  static reconstitute(
    params: EnrollmentReconstituteParams,
  ): Enrollment {
    return new Enrollment(
      params.id,
      EnrollmentNumber.create(params.enrollmentNumber),
      params.studentId,
      params.branchId,
      params.categoryId,
      params.courseId,
      params.batchId,
      params.admissionDate,
      params.joiningDate,
      params.expectedCompletionDate,
      params.feeAmount,
      params.discountAmount,
      params.finalAmount,
      params.paidAmount,
      params.dueAmount,
      params.paymentStatus,
      params.status,
      params.source,
      params.remarks,
      params.rejectionReason,
      params.isActive,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: EnrollmentUpdateParams) {
    if (params.studentId !== undefined) this.studentId = params.studentId;
    if (params.branchId !== undefined) this.branchId = params.branchId;
    if (params.categoryId !== undefined) this.categoryId = params.categoryId;
    if (params.courseId !== undefined) this.courseId = params.courseId;
    if (params.batchId !== undefined) this.batchId = params.batchId;

    if (params.admissionDate !== undefined)
      this.admissionDate = params.admissionDate;
    if (params.joiningDate !== undefined)
      this.joiningDate = params.joiningDate;
    if (params.expectedCompletionDate !== undefined)
      this.expectedCompletionDate = params.expectedCompletionDate;

    if (params.feeAmount !== undefined)
      this.feeAmount = Money.create(params.feeAmount).getValue();
    if (params.discountAmount !== undefined)
      this.discountAmount = Money.create(
        params.discountAmount,
      ).getValue();
    if (params.paidAmount !== undefined)
      this.paidAmount = Money.create(params.paidAmount).getValue();

    if (params.remarks !== undefined)
      this.remarks = sanitizeText(params.remarks, 4000);

    if (params.rejectionReason !== undefined)
      this.rejectionReason = sanitizeText(params.rejectionReason, 2000);

    if (params.status !== undefined) this.status = params.status;

    // isActive is a manual flag, independent of the enrollment status.
    if (params.isActive !== undefined) this.isActive = params.isActive;

    this.recalculateFinancials();

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  changeStatus(
    status: EnrollmentStatus,
    updatedBy?: string | null,
  ) {
    this.status = status;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
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

  // A seat is held while the student is admitted or currently active.
  // Historical statuses (completed, dropped, cancelled, rejected) do not occupy seats.
  occupiesSeat(): boolean {
    return Enrollment.statusOccupiesSeat(this.status);
  }

  static statusOccupiesSeat(status: EnrollmentStatus): boolean {
    return (
      status === EnrollmentStatus.ADMITTED ||
      status === EnrollmentStatus.ACTIVE
    );
  }

  static currentStatuses(): EnrollmentStatus[] {
    return [
      EnrollmentStatus.PENDING,
      EnrollmentStatus.PENDING_APPROVAL,
      EnrollmentStatus.ADMITTED,
      EnrollmentStatus.ACTIVE,
    ];
  }

  static isCurrentStatus(status: EnrollmentStatus): boolean {
    return Enrollment.currentStatuses().includes(status);
  }

  isCurrent(): boolean {
    return !this.isDeleted && Enrollment.isCurrentStatus(this.status);
  }

  private recalculateFinancials() {
    if (this.discountAmount > this.feeAmount) {
      throw new InvalidDiscountException();
    }

    this.finalAmount = round(this.feeAmount - this.discountAmount);

    if (this.paidAmount > this.finalAmount) {
      throw new InvalidPaymentAmountException();
    }

    this.dueAmount = round(this.finalAmount - this.paidAmount);

    if (this.finalAmount <= 0) {
      this.paymentStatus = PaymentStatus.PAID;
      this.dueAmount = 0;
      return;
    }

    if (this.paidAmount <= 0) {
      this.paymentStatus = PaymentStatus.UNPAID;
    } else if (this.paidAmount >= this.finalAmount) {
      this.paymentStatus = PaymentStatus.PAID;
    } else {
      this.paymentStatus = PaymentStatus.PARTIAL;
    }
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface EnrollmentCreateParams {
  id: string;
  enrollmentNumber: string;
  studentId: string;
  branchId: string;
  categoryId: string;
  courseId: string;
  batchId: string;
  admissionDate?: Date | null;
  joiningDate?: Date | null;
  expectedCompletionDate?: Date | null;
  feeAmount?: number | null;
  discountAmount?: number | null;
  paidAmount?: number | null;
  status?: EnrollmentStatus;
  source?: EnrollmentSource;
  remarks?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface EnrollmentUpdateParams {
  studentId?: string;
  branchId?: string;
  categoryId?: string;
  courseId?: string;
  batchId?: string;
  admissionDate?: Date | null;
  joiningDate?: Date | null;
  expectedCompletionDate?: Date | null;
  feeAmount?: number;
  discountAmount?: number;
  paidAmount?: number;
  remarks?: string | null;
  rejectionReason?: string | null;
  status?: EnrollmentStatus;
  isActive?: boolean;
  updatedBy?: string | null;
}

export interface EnrollmentReconstituteParams {
  id: string;
  enrollmentNumber: string;
  studentId: string;
  branchId: string;
  categoryId: string;
  courseId: string;
  batchId: string;
  admissionDate: Date | null;
  joiningDate: Date | null;
  expectedCompletionDate: Date | null;
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  remarks: string | null;
  rejectionReason: string | null;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const round = (value: number) => Math.round(value * 100) / 100;

const sanitizeText = (value?: string | null, maxLength = 1000) => {
  const normalized = value?.trim() || null;
  return normalized ? normalized.slice(0, maxLength) : null;
};
