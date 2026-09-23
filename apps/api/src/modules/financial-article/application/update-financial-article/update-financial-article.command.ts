import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

export class UpdateFinancialArticleCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly shortDescription?: string | null,
    public readonly content?: string,
    public readonly thumbnailFileId?: string | null,
    public readonly bannerFileId?: string | null,
    public readonly authorName?: string | null,
    public readonly metaTitle?: string | null,
    public readonly metaDescription?: string | null,
    public readonly metaKeywords?: string | null,
    public readonly tags?: string[],
    public readonly categoryId?: string,
    public readonly status?: FinancialArticleStatus,
    public readonly updatedBy?: string,
  ) {}
}
