import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

export class ListFinancialArticlesQuery {
  constructor(
    public readonly categoryId?: string,
    public readonly status?: FinancialArticleStatus,
    public readonly search?: string,
    public readonly includeDeleted?: boolean,
    public readonly onlyPublished?: boolean,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
