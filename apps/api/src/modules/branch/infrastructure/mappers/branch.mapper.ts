// src/modules/branch/infrastructure/mappers/branch.mapper.ts

import { Branch as PrismaBranch } from '@prisma/client';

import { Branch } from '../../domain/entities/branch.entity';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class BranchMapper {
  static toDomain(record: PrismaBranch): Branch {
    return Branch.reconstitute({
      id: record.id,

      branchName: record.branchName,
      branchCode: record.branchCode,
      slug: record.slug,

      email: record.email,
      phone: record.phone,

      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2,

      city: record.city,
      state: record.state,
      country: record.country,

      postalCode: record.postalCode,

      latitude: record.latitude,
      longitude: record.longitude,

      status: record.status as BranchStatus,

      description: record.description,

      thumbnailFileId: record.thumbnailFileId,
      thumbnailUrl: record.thumbnailUrl,

      displayOrder: record.displayOrder ?? null,

      deletedAt: record.deletedAt,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(branch: Branch) {
    return {
      id: branch.id,

      branchName: branch.branchName.getValue(),

      branchCode: branch.branchCode.getValue(),

      slug: branch.slug,

      email: branch.email?.getValue() ?? null,

      phone: branch.phone?.getValue() ?? null,

      addressLine1: branch.addressLine1,

      addressLine2: branch.addressLine2,

      city: branch.city,
      state: branch.state,
      country: branch.country,

      postalCode: branch.postalCode,

      latitude: branch.latitude,
      longitude: branch.longitude,

      status: branch.status,

      description: branch.description,

      thumbnailFileId: branch.thumbnailFileId,
      thumbnailUrl: branch.thumbnailUrl,

      displayOrder: branch.displayOrder,

      deletedAt: branch.deletedAt,

      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
    };
  }
}
