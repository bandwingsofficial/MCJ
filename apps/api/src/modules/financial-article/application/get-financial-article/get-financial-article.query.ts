export class GetFinancialArticleQuery {
  constructor(
    public readonly id: string,
    public readonly includeDeleted = false,
  ) {}
}
