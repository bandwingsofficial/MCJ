export class GetFinancialArticleBySlugQuery {
  constructor(
    public readonly slug: string,
    public readonly onlyPublic = false,
  ) {}
}
