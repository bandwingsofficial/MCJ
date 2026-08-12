export class DeleteCommunityPostCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}

export class DeleteCommunityPostResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | null,
  ) {}
}
