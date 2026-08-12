// src/modules/profile/application/delete-profile/delete-profile.result.ts

export class DeleteProfileResult {
  constructor(
    public readonly success: boolean,

    public readonly message: string,
  ) {}
}