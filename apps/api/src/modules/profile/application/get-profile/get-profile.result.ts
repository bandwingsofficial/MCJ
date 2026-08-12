// src/modules/profile/application/get-profile/get-profile.result.ts

import { Gender } from '../../domain/enums/gender.enum';

export class GetProfileResult {
  constructor(
    public readonly id: string,

    public readonly userId: string,

    public readonly firstName: string | null,
    public readonly lastName: string | null,

    public readonly email: string | null,
    public readonly phone: string | null,

    public readonly gender: Gender | null,

    public readonly dob: Date | null,

    public readonly profileImage: string | null,

    // 📍 address
    public readonly addressLine1: string | null,
    public readonly addressLine2: string | null,

    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,

    public readonly postalCode: string | null,

    // 🧠 extras
    public readonly bio: string | null,

    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}