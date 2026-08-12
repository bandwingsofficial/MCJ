export class RestoreBatchCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
