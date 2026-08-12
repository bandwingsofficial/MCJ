import { BranchUser as PrismaBranchUser } from '@prisma/client';

import { BranchUser } from '../../domain/entities/branch-user.entity';
import { BranchUserRole } from '../../domain/enums/branch-user-role.enum';
import { Permission } from '../../domain/enums/permission.enum';

export class BranchUserMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(
    record: PrismaBranchUser,
  ): BranchUser {
    return BranchUser.reconstitute({
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phone: record.phone,
      password: record.password,
      role: record.role as BranchUserRole,
      permissions:
        record.permissions as Permission[],
      branchId: record.branchId,
      isActive: record.isActive,
      isDeleted: record.isDeleted,
      lastLoginAt: record.lastLoginAt,
      refreshToken: record.refreshToken,
      refreshTokenExpiresAt:
        record.refreshTokenExpiresAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(
    branchUser: BranchUser,
  ) {
    return {
      id: branchUser.id,
      firstName:
        branchUser.firstName.getValue(),
      lastName:
        branchUser.lastName?.getValue() ?? null,
      email: branchUser.email.getValue(),
      phone:
        branchUser.phone?.getValue() ?? null,
      password: branchUser.password,
      role: branchUser.role,
      permissions: branchUser.permissions,
      branchId: branchUser.branchId,
      isActive: branchUser.isActive,
      isDeleted: branchUser.isDeleted,
      lastLoginAt: branchUser.lastLoginAt,
      refreshToken: branchUser.refreshToken,
      refreshTokenExpiresAt:
        branchUser.refreshTokenExpiresAt,
      createdBy: branchUser.createdBy,
      updatedBy: branchUser.updatedBy,
      createdAt: branchUser.createdAt,
      updatedAt: branchUser.updatedAt,
    };
  }
}
