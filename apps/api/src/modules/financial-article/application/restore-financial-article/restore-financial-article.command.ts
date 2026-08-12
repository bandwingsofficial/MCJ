export class RestoreFinancialArticleCommand {
  constructor(
    public readonly id: string,
    public readonly updatedBy?: string,
  ) {}
}
