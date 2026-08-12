import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { BranchUserRole } from '../enums/branch-user-role.enum';
import { Permission } from '../enums/permission.enum';
import { BranchUserFirstName } from '../value-objects/branch-user-first-name.vo';
import { BranchUserLastName } from '../value-objects/branch-user-last-name.vo';
import { BranchUserEmail } from '../value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../value-objects/branch-user-phone.vo';

export class BranchUser {
  private constructor(
    public readonly id: string,
    public firstName: BranchUserFirstName,
    public lastName: BranchUserLastName | null,
    public email: BranchUserEmail,
    public phone: BranchUserPhone | null,
    public password: string,
    public role: BranchUserRole,
    public permissions: Permission[],
    public branchId: string,
    public isActive: boolean,
    public isDeleted: boolean,
    public lastLoginAt: Date | null,
    public refreshToken: string | null,
    public refreshTokenExpiresAt: Date | null,
    public createdBy: string | null,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    firstName: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    password: string;
    role?: BranchUserRole;
    permissions?: Permission[];
    branchId: string;
    createdBy?: string | null;
  }): BranchUser {
    return new BranchUser(
      params.id,
      BranchUserFirstName.create(params.firstName),
      params.lastName
        ? BranchUserLastName.create(
            params.lastName,
          )
        : null,
      BranchUserEmail.create(params.email),
      params.phone
        ? BranchUserPhone.create(params.phone)
        : null,
      params.password,
      params.role ?? BranchUserRole.STAFF,
      params.permissions ?? [],
      BranchUser.normalizeRequired(
        params.branchId,
        'Branch id is required',
      ),
      true,
      false,
      null,
      null,
      null,
      params.createdBy ?? null,
      params.createdBy ?? null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    password: string;
    role: BranchUserRole;
    permissions: Permission[];
    branchId: string;
    isActive: boolean;
    isDeleted: boolean;
    lastLoginAt: Date | null;
    refreshToken: string | null;
    refreshTokenExpiresAt: Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): BranchUser {
    return new BranchUser(
      params.id,
      BranchUserFirstName.create(params.firstName),
      params.lastName
        ? BranchUserLastName.create(
            params.lastName,
          )
        : null,
      BranchUserEmail.create(params.email),
      params.phone
        ? BranchUserPhone.create(params.phone)
        : null,
      params.password,
      params.role,
      params.permissions,
      params.branchId,
      params.isActive,
      params.isDeleted,
      params.lastLoginAt,
      params.refreshToken,
      params.refreshTokenExpiresAt,
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  updateProfile(params: {
    firstName?: string;
    lastName?: string | null;
    email?: string;
    phone?: string | null;
    branchId?: string;
    updatedBy?: string | null;
  }) {
    if (params.firstName !== undefined) {
      this.firstName =
        BranchUserFirstName.create(
          params.firstName,
        );
    }

    if (params.lastName !== undefined) {
      this.lastName =
        params.lastName
          ? BranchUserLastName.create(
              params.lastName,
            )
          : null;
    }

    if (params.email !== undefined) {
      this.email =
        BranchUserEmail.create(params.email);
    }

    if (params.phone !== undefined) {
      this.phone =
        params.phone
          ? BranchUserPhone.create(params.phone)
          : null;
    }

    if (params.branchId !== undefined) {
      this.branchId =
        BranchUser.normalizeRequired(
          params.branchId,
          'Branch id is required',
        );
    }

    this.touch(params.updatedBy);
  }

  changeRole(
    role: BranchUserRole,
    updatedBy?: string | null,
  ) {
    this.role = role;
    this.touch(updatedBy);
  }

  assignPermissions(
    permissions: Permission[],
    updatedBy?: string | null,
  ) {
    this.permissions = [
      ...new Set(permissions),
    ];
    this.touch(updatedBy);
  }

  changePassword(
    passwordHash: string,
    updatedBy?: string | null,
  ) {
    this.password = passwordHash;
    this.touch(updatedBy);
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.touch(updatedBy);
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.touch(updatedBy);
  }

  softDelete(updatedBy?: string | null) {
    this.isDeleted = true;
    this.isActive = false;
    this.touch(updatedBy);
  }

  restore(): void {
  this.isDeleted = false;
  this.isActive = true;

  this.touch();
}

isRestorable(): boolean {
  return this.isDeleted;
}

  markLoggedIn(
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ) {
    this.lastLoginAt = new Date();
    this.refreshToken = refreshTokenHash;
    this.refreshTokenExpiresAt =
      refreshTokenExpiresAt;
    this.touch();
  }

  rotateRefreshToken(
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ) {
    this.refreshToken = refreshTokenHash;
    this.refreshTokenExpiresAt =
      refreshTokenExpiresAt;
    this.touch();
  }

  revokeRefreshToken() {
    this.refreshToken = null;
    this.refreshTokenExpiresAt = null;
    this.touch();
  }

  canLogin(): boolean {
    if (this.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_DELETED,
        'Branch user has been deleted',
        403,
      );
    }

    if (!this.isActive) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_INACTIVE,
        'Branch user account is inactive',
        403,
      );
    }

    return true;
  }

  hasPermission(permission: Permission): boolean {
    return this.permissions.includes(permission);
  }

  private touch(updatedBy?: string | null) {
    if (updatedBy !== undefined) {
      this.updatedBy = updatedBy;
    }

    this.updatedAt = new Date();
  }

  private static normalizeRequired(
    value: string,
    message: string,
  ): string {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        message,
        400,
      );
    }

    return normalized;
  }

}
