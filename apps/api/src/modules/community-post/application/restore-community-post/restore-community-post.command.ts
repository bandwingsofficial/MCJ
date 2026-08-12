export class RestoreCommunityPostCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
