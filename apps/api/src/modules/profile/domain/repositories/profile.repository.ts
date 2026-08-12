// src/modules/profile/domain/repositories/profile.repository.ts

import { Profile } from '../entities/profile.entity';

export interface ProfileRepository {
  // =====================
  // 💾 PERSISTENCE
  // =====================

  save(profile: Profile): Promise<void>;

  delete(profileId: string): Promise<void>;

  // =====================
  // 🔍 FINDERS
  // =====================

  findById(id: string): Promise<Profile | null>;

  findByUserId(userId: string): Promise<Profile | null>;

  // 🔥 optional admin helpers
  findAll(): Promise<Profile[]>;

  // =====================
  // ✅ EXISTENCE CHECKS
  // =====================

  existsById(id: string): Promise<boolean>;

  existsByUserId(userId: string): Promise<boolean>;

  // =====================
  // 🧠 PROFILE OPERATIONS
  // =====================

  updateProfileImage(
    profileId: string,
    image: string | null,
  ): Promise<void>;

  updateBio(
    profileId: string,
    bio: string | null,
  ): Promise<void>;

  updateAddress(
    profileId: string,
    params: {
      addressLine1?: string | null;
      addressLine2?: string | null;

      city?: string | null;
      state?: string | null;
      country?: string | null;

      postalCode?: string | null;
    },
  ): Promise<void>;
}