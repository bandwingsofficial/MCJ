export class UpdateCommunityPostActivationCommand {
  constructor(
    public readonly id: string,
    public readonly activate: boolean,
    public readonly updatedBy?: string,
  ) {}
}
