import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type {
  BranchUserListFilters,
  BranchUserRepository,
} from '../../domain/repositories/branch-user.repository';

import { BranchUser } from '../../domain/entities/branch-user.entity';
import { BranchUserMapper } from '../mappers/branch-user.mapper';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';

export class PrismaBranchUserRepository
  implements BranchUserRepository
{
  private readonly logger = new Logger(
    PrismaBranchUserRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // 💾 SAVE
  // =====================

  async save(
    branchUser: BranchUser,
  ): Promise<void> {
    this.logger.log(
      `💾 Saving branch user: ${branchUser.id}`,
    );

    const data =
      BranchUserMapper.toPersistence(branchUser);

    try {
      const existing = await this.prisma.branchUser.findUnique({
        where: { id: branchUser.id },
        select: { id: true },
      });

      if (existing) {
        const { id: _id, createdAt: _createdAt, ...updateData } = data;

        await this.prisma.branchUser.update({
          where: { id: branchUser.id },
          data: updateData,
        });
        return;
      }

      await this.prisma.branchUser.create({
        data,
      });
    } catch (error) {
      this.rethrowUniqueConstraint(error);
      throw error;
    }
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(
    id: string,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findByEmail(
    email: BranchUserEmail,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          email: email.getValue(),
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findByPhone(
    phone: BranchUserPhone,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          phone: phone.getValue(),
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findByEmailIncludingDeleted(
    email: BranchUserEmail,
  ): Promise<BranchUser | null> {
    const record = await this.prisma.branchUser.findFirst({
      where: {
        email: {
          equals: email.getValue(),
          mode: 'insensitive',
        },
      },
    });

    return record ? BranchUserMapper.toDomain(record) : null;
  }

  async findByPhoneIncludingDeleted(
    phone: BranchUserPhone,
  ): Promise<BranchUser | null> {
    const record = await this.prisma.branchUser.findFirst({
      where: { phone: phone.getValue() },
    });

    return record ? BranchUserMapper.toDomain(record) : null;
  }

  async findAll(
    filters: BranchUserListFilters = {},
  ): Promise<BranchUser[]> {
    const records =
      await this.prisma.branchUser.findMany({
        where: this.buildWhere(filters),
        orderBy: {
          createdAt: 'desc',
        },
        skip: filters.skip,
        take: filters.take,
      });

    return records.map(
      BranchUserMapper.toDomain,
    );
  }

  async count(
    filters: BranchUserListFilters = {},
  ): Promise<number> {
    return this.prisma.branchUser.count({
      where: this.buildWhere(filters),
    });
  }

  async findByIdIncludingDeleted(
  id: string,
): Promise<BranchUser | null> {
  const record =
    await this.prisma.branchUser.findUnique({
      where: { id },
    });

  return record
    ? BranchUserMapper.toDomain(record)
    : null;
}

  // =====================
  // ✅ EXISTS
  // =====================

  async existsById(id: string): Promise<boolean> {
    const count =
      await this.prisma.branchUser.count({
        where: {
          id,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  async existsByEmail(
    email: BranchUserEmail,
  ): Promise<boolean> {
    const record = await this.prisma.branchUser.findUnique({
      where: { email: email.getValue() },
      select: { id: true },
    });

    return Boolean(record);
  }

  async existsByPhone(
    phone: BranchUserPhone,
  ): Promise<boolean> {
    const record = await this.prisma.branchUser.findUnique({
      where: { phone: phone.getValue() },
      select: { id: true },
    });

    return Boolean(record);
  }

  async branchExists(
    branchId: string,
  ): Promise<boolean> {
    const count = await this.prisma.branch.count({
      where: {
        id: branchId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  private buildWhere(
    filters: BranchUserListFilters,
  ): Prisma.BranchUserWhereInput {
    const where: Prisma.BranchUserWhereInput = {};

    if (filters.isDeleted === true) {
      where.isDeleted = true;
    } else if (filters.isDeleted === false) {
      where.isDeleted = false;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      where.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search.toLowerCase(),
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: search,
          },
        },
      ];
    }

    return where;
  }

  async rotateRefreshTokenIfMatches(params: {
    branchUserId: string;
    expectedHash: string;
    newHash: string;
    expiresAt: Date;
  }): Promise<boolean> {
    const result = await this.prisma.branchUser.updateMany({
      where: {
        id: params.branchUserId,
        refreshToken: params.expectedHash,
        isDeleted: false,
        isActive: true,
      },
      data: {
        refreshToken: params.newHash,
        refreshTokenExpiresAt: params.expiresAt,
        updatedAt: new Date(),
      },
    });

    return result.count === 1;
  }

  async runInTransaction<T>(
    work: (repo: BranchUserRepository) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const scoped = new PrismaBranchUserRepository(
        tx as unknown as PrismaService,
      );
      return work(scoped);
    });
  }

  async permanentDelete(id: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.batchFaculty.deleteMany({
          where: { branchUserId: id },
        });
        await tx.attendance.updateMany({
          where: { facultyId: id },
          data: { facultyId: null },
        });
        await tx.academicAssessment.updateMany({
          where: { facultyId: id },
          data: { facultyId: null },
        });
        await tx.interview.updateMany({
          where: { interviewerId: id },
          data: { interviewerId: null },
        });
        await tx.branchActivityLog.updateMany({
          where: { actorId: id },
          data: { actorId: null },
        });
        await tx.branchUser.delete({
          where: { id },
        });
      });
    } catch (error) {
      this.rethrowUniqueConstraint(error);
      throw error;
    }
  }

  private rethrowUniqueConstraint(error: unknown): void {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return;
    }

    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(',')
      : String(error.meta?.target ?? '');
    const normalized = target.toLowerCase();

    if (normalized.includes('phone')) {
      throw new BaseException(
        ERROR_CODES.PHONE_ALREADY_EXISTS,
        'A user with this phone number already exists.',
        409,
        { field: 'phone' },
      );
    }

    throw new BaseException(
      ERROR_CODES.EMAIL_ALREADY_EXISTS,
      'A user with this email already exists.',
      409,
      { field: 'email' },
    );
  }
}
