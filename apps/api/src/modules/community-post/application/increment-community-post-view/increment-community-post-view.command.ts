export class IncrementCommunityPostViewCommand {
  constructor(public readonly id: string) {}
}

export class IncrementCommunityPostViewResult {
  constructor(
    public readonly id: string,
    public readonly viewCount: number,
  ) {}
}
