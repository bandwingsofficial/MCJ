import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

export class CreateFinancialArticleCommand {
  constructor(
    public readonly title: string,
    public readonly categoryId: string,
    public readonly content: string,
    public readonly shortDescription?: string | null,
    public readonly thumbnailFileId?: string | null,
    public readonly bannerFileId?: string | null,
    public readonly authorName?: string | null,
    public readonly metaTitle?: string | null,
    public readonly metaDescription?: string | null,
    public readonly metaKeywords?: string | null,
    public readonly tags?: string[],
    public readonly status?: FinancialArticleStatus,
    public readonly createdBy?: string,
  ) {}
}
