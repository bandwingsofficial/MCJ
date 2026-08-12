export class DeleteFinancialArticleCommand {
  constructor(
    public readonly id: string,
    public readonly deletedBy?: string,
  ) {}
}
