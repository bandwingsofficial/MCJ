// src/modules/branch/domain/entities/branch.entity.ts

import { BranchStatus } from '../enums/branch-status.enum';

import { BranchName } from '../value-objects/branch-name.vo';
import { BranchCode } from '../value-objects/branch-code.vo';
import { BranchEmail } from '../value-objects/branch-email.vo';
import { BranchPhone } from '../value-objects/branch-phone.vo';

export class Branch {
  private constructor(
    public readonly id: string,

    public branchName: BranchName,

    public branchCode: BranchCode,

    public email: BranchEmail | null,
    public phone: BranchPhone | null,

    public addressLine1: string | null,
    public addressLine2: string | null,

    public city: string | null,
    public state: string | null,
    public country: string | null,

    public postalCode: string | null,

    public latitude: number | null,
    public longitude: number | null,

    public status: BranchStatus,

    public description: string | null,

    public deletedAt: Date | null,

    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  // =====================
  // 🟢 FACTORY
  // =====================

  static create(params: {
    id: string;

    branchName: string;
    branchCode: string;

    email?: string;
    phone?: string;

    addressLine1?: string;
    addressLine2?: string;

    city?: string;
    state?: string;
    country?: string;

    postalCode?: string;

    latitude?: number;
    longitude?: number;

    status?: BranchStatus;

    description?: string;
  }): Branch {
    return new Branch(
      params.id,

      BranchName.create(params.branchName),

      BranchCode.create(params.branchCode),

      params.email
        ? BranchEmail.create(params.email)
        : null,

      params.phone
        ? BranchPhone.create(params.phone)
        : null,

      params.addressLine1?.trim() ?? null,
      params.addressLine2?.trim() ?? null,

      params.city?.trim() ?? null,
      params.state?.trim() ?? null,
      params.country?.trim() ?? null,

      params.postalCode?.trim() ?? null,

      params.latitude ?? null,
      params.longitude ?? null,

      params.status ?? BranchStatus.ACTIVE,

      params.description?.trim() ?? null,

      null,

      new Date(),
      new Date(),
    );
  }

  // =====================
  // 🔵 RECONSTITUTE
  // =====================

  static reconstitute(params: {
    id: string;

    branchName: string;
    branchCode: string;

    email: string | null;
    phone: string | null;

    addressLine1: string | null;
    addressLine2: string | null;

    city: string | null;
    state: string | null;
    country: string | null;

    postalCode: string | null;

    latitude: number | null;
    longitude: number | null;

    status: BranchStatus;

    description: string | null;

    deletedAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
  }): Branch {
    return new Branch(
      params.id,

      BranchName.create(params.branchName),

      BranchCode.create(params.branchCode),

      params.email
        ? BranchEmail.create(params.email)
        : null,

      params.phone
        ? BranchPhone.create(params.phone)
        : null,

      params.addressLine1,
      params.addressLine2,

      params.city,
      params.state,
      params.country,

      params.postalCode,

      params.latitude,
      params.longitude,

      params.status,

      params.description,

      params.deletedAt,

      params.createdAt,
      params.updatedAt,
    );
  }

  // =====================
  // 🧠 BRANCH BEHAVIOR
  // =====================

  changeBranchName(branchName: string) {
    this.branchName =
      BranchName.create(branchName);

    this.touch();
  }

  changeBranchCode(branchCode: string) {
    this.branchCode =
      BranchCode.create(branchCode);

    this.touch();
  }

  changeEmail(email: string | null) {
    this.email = email
      ? BranchEmail.create(email)
      : null;

    this.touch();
  }

  changePhone(phone: string | null) {
    this.phone = phone
      ? BranchPhone.create(phone)
      : null;

    this.touch();
  }

  changeStatus(status: BranchStatus) {
    this.status = status;

    this.touch();
  }

  activate() {
    this.changeStatus(BranchStatus.ACTIVE);
  }

  deactivate() {
    this.changeStatus(BranchStatus.INACTIVE);
  }

  restore() {
  this.deletedAt = null;
  this.status = BranchStatus.ACTIVE;

  this.touch();
}

  changeDescription(
    description: string | null,
  ) {
    this.description =
      description?.trim() ?? null;

    this.touch();
  }

  updateLocation(params: {
    latitude?: number | null;
    longitude?: number | null;
  }) {
    if (params.latitude !== undefined) {
      this.latitude = params.latitude;
    }

    if (params.longitude !== undefined) {
      this.longitude = params.longitude;
    }

    this.touch();
  }

  updateAddress(params: {
    addressLine1?: string | null;
    addressLine2?: string | null;

    city?: string | null;
    state?: string | null;
    country?: string | null;

    postalCode?: string | null;
  }) {
    if (params.addressLine1 !== undefined) {
      this.addressLine1 =
        params.addressLine1?.trim() ?? null;
    }

    if (params.addressLine2 !== undefined) {
      this.addressLine2 =
        params.addressLine2?.trim() ?? null;
    }

    if (params.city !== undefined) {
      this.city =
        params.city?.trim() ?? null;
    }

    if (params.state !== undefined) {
      this.state =
        params.state?.trim() ?? null;
    }

    if (params.country !== undefined) {
      this.country =
        params.country?.trim() ?? null;
    }

    if (params.postalCode !== undefined) {
      this.postalCode =
        params.postalCode?.trim() ?? null;
    }

    this.touch();
  }

  // =====================
  // 🧠 BUSINESS RULES
  // =====================

  isActive(): boolean {
    return this.status === BranchStatus.ACTIVE;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  hasLocation(): boolean {
    return (
      this.latitude !== null &&
      this.longitude !== null
    );
  }

  hasContactInfo(): boolean {
    return !!this.email || !!this.phone;
  }

  // =====================
  // 🛠️ INTERNAL
  // =====================

  private touch() {
    this.updatedAt = new Date();
  }
}