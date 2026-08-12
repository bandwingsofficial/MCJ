import { FinancialArticleStatus } from '../enums/financial-article-status.enum';
import { AuthorName } from '../value-objects/author-name.vo';
import { Content } from '../value-objects/content.vo';
import { ShortDescription } from '../value-objects/short-description.vo';
import { Slug } from '../value-objects/slug.vo';
import { Tag } from '../value-objects/tag.vo';
import { Title } from '../value-objects/title.vo';

export class FinancialArticle {
  private constructor(
    public readonly id: string,
    public title: Title,
    public slug: Slug,
    public shortDescription: ShortDescription,
    public content: Content,
    public thumbnailFileId: string | null,
    public thumbnailUrl: string | null,
    public bannerFileId: string | null,
    public bannerUrl: string | null,
    public authorName: AuthorName,
    public authorImage: string | null,
    public tags: string[],
    public categoryId: string,
    public displayOrder: number,
    public status: FinancialArticleStatus,
    public isActive: boolean,
    public publishedAt: Date | null,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: FinancialArticleCreateParams): FinancialArticle {
    return new FinancialArticle(
      params.id,
      Title.create(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      ShortDescription.create(params.shortDescription),
      Content.createRequired(params.content),
      params.thumbnailFileId ?? null,
      params.thumbnailUrl ?? null,
      params.bannerFileId ?? null,
      params.bannerUrl ?? null,
      AuthorName.create(params.authorName),
      params.authorImage ?? null,
      Tag.createMany(params.tags),
      params.categoryId,
      params.displayOrder ?? 0,
      params.status ?? FinancialArticleStatus.DRAFT,
      params.isActive ?? true,
      params.publishedAt ?? null,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: FinancialArticleReconstituteParams,
  ): FinancialArticle {
    return new FinancialArticle(
      params.id,
      Title.create(params.title),
      Slug.create(params.slug),
      ShortDescription.create(params.shortDescription),
      Content.create(params.content),
      params.thumbnailFileId,
      params.thumbnailUrl,
      params.bannerFileId,
      params.bannerUrl,
      AuthorName.create(params.authorName),
      params.authorImage,
      params.tags,
      params.categoryId,
      params.displayOrder,
      params.status,
      params.isActive,
      params.publishedAt,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: FinancialArticleUpdateParams) {
    if (params.title !== undefined) {
      this.title = Title.create(params.title);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.shortDescription !== undefined) {
      this.shortDescription = ShortDescription.create(
        params.shortDescription,
      );
    }
    if (params.content !== undefined) {
      this.content = Content.createRequired(params.content);
    }
    if (params.thumbnailFileId !== undefined) {
      this.thumbnailFileId = params.thumbnailFileId;
    }
    if (params.thumbnailUrl !== undefined) {
      this.thumbnailUrl = params.thumbnailUrl;
    }
    if (params.bannerFileId !== undefined) {
      this.bannerFileId = params.bannerFileId;
    }
    if (params.bannerUrl !== undefined) {
      this.bannerUrl = params.bannerUrl;
    }
    if (params.authorName !== undefined) {
      this.authorName = AuthorName.create(params.authorName);
    }
    if (params.authorImage !== undefined) {
      this.authorImage = params.authorImage;
    }
    if (params.tags !== undefined) {
      this.tags = Tag.createMany(params.tags);
    }
    if (params.categoryId !== undefined) {
      this.categoryId = params.categoryId;
    }
    if (params.status !== undefined) {
      this.status = params.status;
    }
    if (params.publishedAt !== undefined) {
      this.publishedAt = params.publishedAt;
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  moveTo(displayOrder: number, updatedBy?: string | null) {
    this.displayOrder = displayOrder;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  isPubliclyVisible(): boolean {
    return (
      !this.isDeleted &&
      this.isActive &&
      this.status === FinancialArticleStatus.PUBLISHED
    );
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface FinancialArticleCreateParams {
  id: string;
  title: string;
  slug?: string;
  shortDescription?: string | null;
  content: string;
  thumbnailFileId?: string | null;
  thumbnailUrl?: string | null;
  bannerFileId?: string | null;
  bannerUrl?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
  tags?: string[];
  categoryId: string;
  displayOrder?: number;
  status?: FinancialArticleStatus;
  isActive?: boolean;
  publishedAt?: Date | null;
  createdBy?: string | null;
}

export interface FinancialArticleUpdateParams
  extends Partial<
    Omit<FinancialArticleCreateParams, 'id' | 'createdBy' | 'displayOrder'>
  > {
  updatedBy?: string | null;
}

export interface FinancialArticleReconstituteParams {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string | null;
  thumbnailFileId: string | null;
  thumbnailUrl: string | null;
  bannerFileId: string | null;
  bannerUrl: string | null;
  authorName: string;
  authorImage: string | null;
  tags: string[];
  categoryId: string;
  displayOrder: number;
  status: FinancialArticleStatus;
  isActive: boolean;
  publishedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
