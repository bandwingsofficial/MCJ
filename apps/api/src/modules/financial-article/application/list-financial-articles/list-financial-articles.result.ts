import {
  FinancialArticleAdminResult,
  FinancialArticlePublicResult,
} from '../financial-article.result';

export class ListFinancialArticlesResult<
  TItem =
    | FinancialArticleAdminResult
    | FinancialArticlePublicResult,
> {
  constructor(
    public readonly items: TItem[],
    public readonly total: number,
  ) {}
}
