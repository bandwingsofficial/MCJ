// infrastructure/mappers/user.mapper.ts

import { User as PrismaUser } from '@prisma/client';

import { User } from '../../domain/entities/user.entity';

import { Role } from '../../domain/enums/role.enum';
import { AccountStatus } from '../../domain/enums/account-status.enum';

export class UserMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(record: PrismaUser): User {
    return User.reconstitute({
      id: record.id,

      name: record.name,
      email: record.email,

      passwordHash: record.passwordHash,

      phone: record.phone ?? null,

      role: record.role as Role,
      status: record.status as AccountStatus,

      isEmailVerified: record.isEmailVerified,

      // 🔐 MFA
      mfaEnabled: record.mfaEnabled,
      mfaSecret: record.mfaSecret,
      mfaVerifiedAt: record.mfaVerifiedAt,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(user: User) {
    return {
      id: user.id,

      name: user.name,
      email: user.email.getValue(),

      passwordHash: user.passwordHash,

      phone: user.phone?.getValue() ?? null,

      role: user.role,
      status: user.status,

      isEmailVerified: user.isEmailVerified,

      // 🔐 MFA
      mfaEnabled: user.mfaEnabled,
      mfaSecret: user.mfaSecret,
      mfaVerifiedAt: user.mfaVerifiedAt,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
