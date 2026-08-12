// src/modules/profile/application/get-profile/get-profile.command.ts

export class GetProfileCommand {
  constructor(
    public readonly userId: string,
  ) {}
}