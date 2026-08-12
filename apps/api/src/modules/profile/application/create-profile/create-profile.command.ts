// src/modules/profile/application/commands/create-profile.command.ts

import { Gender } from '../../domain/enums/gender.enum';

export class CreateProfileCommand {
  constructor(
    public readonly userId: string,

    public readonly firstName?: string,
    public readonly lastName?: string,

    public readonly email?: string,
    public readonly phone?: string,

    public readonly gender?: Gender,

    public readonly dob?: Date,

    public readonly profileImage?: string,

    // 📍 address
    public readonly addressLine1?: string,
    public readonly addressLine2?: string,

    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,

    public readonly postalCode?: string,

    // 🧠 extras
    public readonly bio?: string,
  ) {}
}