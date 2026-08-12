// src/modules/profile/infrastructure/mappers/profile.mapper.ts

import { Profile as PrismaProfile } from '@prisma/client';

import { Profile } from '../../domain/entities/profile.entity';

import { Gender } from '../../domain/enums/gender.enum';

export class ProfileMapper {
  // =====================
  // 🔵 DB → DOMAIN
  // =====================

  static toDomain(record: PrismaProfile): Profile {
    return Profile.reconstitute({
      id: record.id,

      userId: record.userId,

      firstName: record.firstName,
      lastName: record.lastName,

      email: record.email,
      phone: record.phone,

      gender: record.gender as Gender,

      dob: record.dob,

      profileImage: record.profileImage,

      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2,

      city: record.city,
      state: record.state,
      country: record.country,

      postalCode: record.postalCode,

      bio: record.bio,

      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  // =====================
  // 🟢 DOMAIN → DB
  // =====================

  static toPersistence(profile: Profile) {
    return {
      id: profile.id,

      userId: profile.userId,

      firstName: profile.firstName?.getValue() ?? null,

      lastName: profile.lastName?.getValue() ?? null,

      email: profile.email,
      phone: profile.phone,

      gender: profile.gender,

      dob: profile.dob?.getValue() ?? null,

      profileImage:
        profile.profileImage?.getValue() ?? null,

      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2,

      city: profile.city,
      state: profile.state,
      country: profile.country,

      postalCode:
        profile.postalCode?.getValue() ?? null,

      bio: profile.bio?.getValue() ?? null,

      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}