export class DeleteJobApplicationResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | null,
  ) {}
}
