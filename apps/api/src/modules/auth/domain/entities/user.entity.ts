// domain/entities/user.entity.ts

import { Role } from '../enums/role.enum';
import { AccountStatus } from '../enums/account-status.enum';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

import { DomainError } from '../errors/domain.error';
import { ERROR_CODES } from '../errors/error-codes';

export class User {
  private constructor(
    public readonly id: string,
    public name: string,
    public email: Email,
    public passwordHash: string,
    public phone: Phone | null,
    public role: Role,
    public status: AccountStatus,
    public isEmailVerified: boolean,
    public mfaEnabled: boolean,
    public mfaSecret: string | null,
    public mfaVerifiedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  // 🟢 Factory
  static create(params: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }): User {
    const name = params.name?.trim();

    if (!name || name.length < 2) {
      throw new DomainError(
        ERROR_CODES.USER_NAME_REQUIRED,
        'Name must be at least 2 characters',
      );
    }

    return new User(
      params.id,
      name,
      Email.create(params.email),
      params.passwordHash,
      params.phone ? Phone.create(params.phone) : null,
      Role.STUDENT,
      AccountStatus.ACTIVE,
      false,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  // 🔵 Reconstitution
  static reconstitute(params: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    phone: string | null;
    role: Role;
    status: AccountStatus;
    isEmailVerified: boolean;
    mfaEnabled: boolean;
    mfaSecret: string | null;
    mfaVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      params.id,
      params.name,
      Email.create(params.email),
      params.passwordHash,
      params.phone ? Phone.create(params.phone) : null,
      params.role,
      params.status,
      params.isEmailVerified,
      params.mfaEnabled,
      params.mfaSecret,
      params.mfaVerifiedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  // =====================
  // 🔐 STATUS BEHAVIOR
  // =====================

  activate() {
    if (this.status === AccountStatus.BLOCKED) {
      throw new DomainError(
        ERROR_CODES.ACCOUNT_BLOCKED,
        'Blocked user cannot be activated',
      );
    }

    this.status = AccountStatus.ACTIVE;
    this.touch();
  }

  deactivate() {
    this.status = AccountStatus.INACTIVE;
    this.touch();
  }

  block() {
    this.status = AccountStatus.BLOCKED;
    this.touch();
  }

  // =====================
  // 🧠 PROFILE UPDATES
  // =====================

  changeName(name: string) {
    const trimmed = name?.trim();

    if (!trimmed || trimmed.length < 2) {
      throw new DomainError(
        ERROR_CODES.USER_NAME_REQUIRED,
        'Name must be at least 2 characters',
      );
    }

    this.name = trimmed;
    this.touch();
  }

  changeEmail(newEmail: string) {
    const email = Email.create(newEmail);

    if (this.email.getValue() === email.getValue()) {
      return;
    }

    this.email = email;
    this.isEmailVerified = false;
    this.touch();
  }

  changePhone(phone?: string | null) {
    this.phone = phone ? Phone.create(phone) : null;
    this.touch();
  }

  // =====================
  // 🔐 SECURITY
  // =====================

  changePassword(newHash: string) {
    if (!newHash) {
      throw new DomainError(
        ERROR_CODES.USER_PASSWORD_INVALID,
        'Password cannot be empty',
      );
    }

    // 🔥 NEW: prevent same password reuse (optional but good)
    if (this.passwordHash === newHash) {
      throw new DomainError(
        ERROR_CODES.USER_PASSWORD_INVALID,
        'New password must be different from old password',
      );
    }

    this.passwordHash = newHash;
    this.touch();
  }

  verifyEmail() {
    if (this.isEmailVerified) return;

    this.isEmailVerified = true;
    this.touch();
  }

  enableMfa(secret: string) {
    if (!secret) {
      throw new DomainError(
        ERROR_CODES.INVALID_MFA_SECRET,
        'MFA secret is required',
      );
    }

    this.mfaEnabled = true;
    this.mfaSecret = secret;
    this.mfaVerifiedAt = new Date();

    this.touch();
  }

  disableMfa() {
    if (this.role === Role.ADMIN) {
      throw new DomainError(
        ERROR_CODES.ADMIN_MFA_REQUIRED,
        'Admins cannot disable MFA',
      );
    }
    this.mfaEnabled = false;
    this.mfaSecret = null;
    this.mfaVerifiedAt = null;

    this.touch();
  }

  // =====================
  // 🔐 PASSWORD RESET SUPPORT (NEW)
  // =====================

  canRequestPasswordReset(): boolean {
    if (this.status === AccountStatus.BLOCKED) {
      throw new DomainError(
        ERROR_CODES.ACCOUNT_BLOCKED,
        'Blocked users cannot reset password',
      );
    }

    return true;
  }

  // =====================
  // 🧠 BUSINESS RULES
  // =====================

  isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  isBlocked(): boolean {
    return this.status === AccountStatus.BLOCKED;
  }
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }
  hasMfaConfigured(): boolean {
    return !!this.mfaSecret && this.mfaEnabled;
  }

  canLogin(): boolean {
    if (this.status === AccountStatus.BLOCKED) {
      throw new DomainError(ERROR_CODES.ACCOUNT_BLOCKED, 'Account is blocked', {
        userId: this.id,
      });
    }

    if (this.status === AccountStatus.INACTIVE) {
      throw new DomainError(
        ERROR_CODES.ACCOUNT_INACTIVE,
        'Account is inactive',
        { userId: this.id },
      );
    }

    return true;
  }

  requiresMfa(): boolean {
    return this.role === Role.ADMIN || this.mfaEnabled;
  }

  // =====================
  // 🛠️ INTERNAL
  // =====================

  private touch() {
    this.updatedAt = new Date();
  }
}
