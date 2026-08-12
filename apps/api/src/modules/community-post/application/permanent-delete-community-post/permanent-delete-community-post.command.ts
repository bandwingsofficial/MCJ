export class PermanentDeleteCommunityPostCommand {
  constructor(public readonly id: string) {}
}

export class PermanentDeleteCommunityPostResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
  ) {}
}
