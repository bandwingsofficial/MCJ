// src/modules/profile/application/delete-profile/delete-profile.command.ts

export class DeleteProfileCommand {
  constructor(
    public readonly userId: string,
  ) {}
}