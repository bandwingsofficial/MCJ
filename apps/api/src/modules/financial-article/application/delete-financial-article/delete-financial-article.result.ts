export class DeleteFinancialArticleResult {
  constructor(
    public readonly id: string,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
  ) {}
}
