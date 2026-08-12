export class IncrementCommunityPostShareCommand {
  constructor(public readonly id: string) {}
}

export class IncrementCommunityPostShareResult {
  constructor(
    public readonly id: string,
    public readonly shareCount: number,
  ) {}
}
