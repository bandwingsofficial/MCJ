export class IncrementCommunityPostShareCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

export class IncrementCommunityPostShareResult {
  constructor(
    public readonly id: string,
    public readonly shareCount: number,
  ) {}
}
