// src/modules/profile/infrastructure/repositories/prisma-profile.repository.ts

import { Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { ProfileRepository } from '../../domain/repositories/profile.repository';

import { Profile } from '../../domain/entities/profile.entity';

import { ProfileMapper } from '../mappers/profile.mapper';

export class PrismaProfileRepository
  implements ProfileRepository
{
  private readonly logger = new Logger(
    PrismaProfileRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  // =====================
  // 💾 SAVE
  // =====================

  async save(profile: Profile): Promise<void> {
    this.logger.log(`💾 Saving profile: ${profile.id}`);

    const data = ProfileMapper.toPersistence(profile);

    await this.prisma.profile.upsert({
      where: {
        id: profile.id,
      },

      update: {
        ...data,
      },

      create: {
        ...data,
      },
    });
  }

  async delete(profileId: string): Promise<void> {
    this.logger.log(`🗑️ Deleting profile: ${profileId}`);

    await this.prisma.profile.delete({
      where: {
        id: profileId,
      },
    });
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(id: string): Promise<Profile | null> {
    const record = await this.prisma.profile.findUnique({
      where: { id },
    });

    return record
      ? ProfileMapper.toDomain(record)
      : null;
  }

  async findByUserId(
    userId: string,
  ): Promise<Profile | null> {
    const record = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    return record
      ? ProfileMapper.toDomain(record)
      : null;
  }

  async findAll(): Promise<Profile[]> {
    const records = await this.prisma.profile.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map(ProfileMapper.toDomain);
  }

  // =====================
  // ✅ EXISTS
  // =====================

  async existsById(id: string): Promise<boolean> {
    const count = await this.prisma.profile.count({
      where: { id },
    });

    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.prisma.profile.count({
      where: { userId },
    });

    return count > 0;
  }

  // =====================
  // 🧠 PROFILE OPERATIONS
  // =====================

  async updateProfileImage(
    profileId: string,
    image: string | null,
  ): Promise<void> {
    await this.prisma.profile.update({
      where: {
        id: profileId,
      },

      data: {
        profileImage: image,
        updatedAt: new Date(),
      },
    });
  }

  async updateBio(
    profileId: string,
    bio: string | null,
  ): Promise<void> {
    await this.prisma.profile.update({
      where: {
        id: profileId,
      },

      data: {
        bio,
        updatedAt: new Date(),
      },
    });
  }

  async updateAddress(
    profileId: string,
    params: {
      addressLine1?: string | null;
      addressLine2?: string | null;

      city?: string | null;
      state?: string | null;
      country?: string | null;

      postalCode?: string | null;
    },
  ): Promise<void> {
    await this.prisma.profile.update({
      where: {
        id: profileId,
      },

      data: {
        addressLine1: params.addressLine1,
        addressLine2: params.addressLine2,

        city: params.city,
        state: params.state,
        country: params.country,

        postalCode: params.postalCode,

        updatedAt: new Date(),
      },
    });
  }
}