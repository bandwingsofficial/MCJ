import { CourseLevel } from '../enums/course-level.enum';
import { CourseQualification } from '../enums/course-qualification.enum';
import { CourseStatus } from '../enums/course-status.enum';
import { DurationType } from '../enums/duration-type.enum';
import { CourseTitle } from '../value-objects/course-title.vo';
import { Duration } from '../value-objects/duration.vo';
import { Price } from '../value-objects/price.vo';
import {
  buildCoursePricing,
  type CoursePricingSnapshot,
} from '../value-objects/course-pricing.vo';
import { ShortDescription } from '../value-objects/short-description.vo';
import { Slug } from '../value-objects/slug.vo';
import { CourseImage } from './course-image.entity';
import { CourseMaterial } from './course-material.entity';

export class Course {
  private constructor(
    public readonly id: string,
    public readonly code: string,
    public title: CourseTitle,
    public slug: Slug,
    public tagline: string | null,
    public shortDescription: ShortDescription,
    public description: string | null,
    public thumbnailFileId: string | null,
    public thumbnailUrl: string | null,
    public originalPrice: Price,
    public discountAmount: Price,
    public discountedPrice: Price,
    public currency: string,
    public isFree: boolean,
    public duration: Duration,
    public durationType: DurationType | null,
    public level: CourseLevel,
    public minimumQualifications: CourseQualification[],
    public language: string,
    public averageRating: number,
    public totalReviews: number,
    public isFeatured: boolean,
    public isPopular: boolean,
    public displayOrder: number | null,
    public metaTitle: string | null,
    public metaDescription: string | null,
    public metaKeywords: string | null,
    public categoryId: string,
    public branchIds: string[],
    public status: CourseStatus,
    public images: CourseImage[],
    public materials: CourseMaterial[],
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: CourseCreateParams): Course {
    const pricing = buildCoursePricing({
      originalPrice: params.originalPrice ?? 0,
      discountAmount: params.discountAmount ?? 0,
      discountedPrice: params.discountedPrice ?? 0,
      currency: params.currency,
      isFree: params.isFree,
    });

    return new Course(
      params.id,
      params.code,
      CourseTitle.create(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      params.tagline ?? null,
      ShortDescription.create(params.shortDescription),
      params.description ?? null,
      params.thumbnailFileId ?? null,
      params.thumbnailUrl ?? null,
      Price.create(pricing.originalPrice),
      Price.create(pricing.discountAmount),
      Price.create(pricing.discountedPrice),
      pricing.currency,
      pricing.isFree,
      Duration.create(params.duration),
      params.durationType ?? null,
      params.level ?? CourseLevel.BEGINNER,
      params.minimumQualifications ?? [],
      params.language?.trim() || 'English',
      params.averageRating ?? 0,
      params.totalReviews ?? 0,
      params.isFeatured ?? false,
      params.isPopular ?? false,
      params.displayOrder ?? null,
      params.metaTitle ?? null,
      params.metaDescription ?? null,
      params.metaKeywords ?? null,
      params.categoryId,
      params.branchIds ?? [],
      params.status ?? CourseStatus.DRAFT,
      params.images ?? [],
      params.materials ?? [],
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: CourseReconstituteParams): Course {
    return new Course(
      params.id,
      params.code,
      CourseTitle.create(params.title),
      Slug.create(params.slug),
      params.tagline,
      ShortDescription.create(params.shortDescription),
      params.description,
      params.thumbnailFileId,
      params.thumbnailUrl,
      Price.create(params.originalPrice),
      Price.create(params.discountAmount),
      Price.create(params.discountedPrice),
      params.currency,
      params.isFree,
      Duration.create(params.duration),
      params.durationType,
      params.level,
      params.minimumQualifications,
      params.language,
      params.averageRating,
      params.totalReviews,
      params.isFeatured,
      params.isPopular,
      params.displayOrder ?? null,
      params.metaTitle,
      params.metaDescription,
      params.metaKeywords,
      params.categoryId,
      params.branchIds,
      params.status,
      params.images,
      params.materials,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CourseUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseTitle.create(params.title);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.tagline !== undefined) this.tagline = params.tagline;
    if (params.shortDescription !== undefined) {
      this.shortDescription = ShortDescription.create(
        params.shortDescription,
      );
    }
    if (params.description !== undefined) this.description = params.description;
    if (params.thumbnailFileId !== undefined) this.thumbnailFileId = params.thumbnailFileId;
    if (params.thumbnailUrl !== undefined) this.thumbnailUrl = params.thumbnailUrl;

    const pricingFieldsTouched =
      params.originalPrice !== undefined ||
      params.discountAmount !== undefined ||
      params.discountedPrice !== undefined ||
      params.currency !== undefined ||
      params.isFree !== undefined;

    if (pricingFieldsTouched) {
      const pricing = buildCoursePricing({
        originalPrice:
          params.originalPrice !== undefined
            ? params.originalPrice
            : this.originalPrice.getValue(),
        discountAmount:
          params.discountAmount !== undefined
            ? params.discountAmount
            : this.discountAmount.getValue(),
        discountedPrice:
          params.discountedPrice !== undefined
            ? params.discountedPrice
            : this.discountedPrice.getValue(),
        currency: params.currency ?? this.currency,
        isFree: params.isFree ?? this.isFree,
      });

      this.originalPrice = Price.create(pricing.originalPrice);
      this.discountAmount = Price.create(pricing.discountAmount);
      this.discountedPrice = Price.create(pricing.discountedPrice);
      this.currency = pricing.currency;
      this.isFree = pricing.isFree;
    }

    if (params.duration !== undefined) this.duration = Duration.create(params.duration);
    if (params.durationType !== undefined) this.durationType = params.durationType;
    if (params.level !== undefined) this.level = params.level;
    if (params.minimumQualifications !== undefined) {
      this.minimumQualifications = params.minimumQualifications;
    }
    if (params.language !== undefined) this.language = params.language;
    if (params.averageRating !== undefined) this.averageRating = params.averageRating;
    if (params.totalReviews !== undefined) this.totalReviews = params.totalReviews;
    if (params.isFeatured !== undefined) this.isFeatured = params.isFeatured;
    if (params.isPopular !== undefined) this.isPopular = params.isPopular;
    if (params.displayOrder !== undefined) this.displayOrder = params.displayOrder ?? null;
    if (params.metaTitle !== undefined) this.metaTitle = params.metaTitle;
    if (params.metaDescription !== undefined) this.metaDescription = params.metaDescription;
    if (params.metaKeywords !== undefined) this.metaKeywords = params.metaKeywords;
    if (params.categoryId !== undefined) this.categoryId = params.categoryId;
    if (params.branchIds !== undefined) this.branchIds = params.branchIds;
    if (params.images !== undefined) this.images = params.images;
    if (params.materials !== undefined) this.materials = params.materials;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.status = CourseStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.status = CourseStatus.INACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  changeDisplayOrder(displayOrder: number | null) {
    this.displayOrder = displayOrder;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.status = CourseStatus.ARCHIVED;
    this.displayOrder = null;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = CourseStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  getPricing(): CoursePricingSnapshot {
    return buildCoursePricing({
      originalPrice: this.originalPrice.getValue(),
      discountAmount: this.discountAmount.getValue(),
      discountedPrice: this.discountedPrice.getValue(),
      currency: this.currency,
      isFree: this.isFree,
    });
  }

  getDefaultDiscountAmount(): number {
    return this.getPricing().discountAmount;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseCreateParams {
  id: string;
  code: string;
  title: string;
  slug?: string;
  tagline?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailFileId?: string | null;
  thumbnailUrl?: string | null;
  originalPrice?: number;
  discountAmount?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
  duration?: number | null;
  durationType?: DurationType | null;
  level?: CourseLevel;
  minimumQualifications?: CourseQualification[];
  language?: string;
  averageRating?: number;
  totalReviews?: number;
  isFeatured?: boolean;
  isPopular?: boolean;
  displayOrder?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  categoryId: string;
  branchIds?: string[];
  status?: CourseStatus;
  images?: CourseImage[];
  materials?: CourseMaterial[];
  createdBy?: string | null;
}

export interface CourseUpdateParams
  extends Partial<Omit<CourseCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}

export interface CourseReconstituteParams
  extends Required<
    Omit<
      CourseCreateParams,
      | 'slug'
      | 'tagline'
      | 'shortDescription'
      | 'description'
      | 'thumbnailFileId'
      | 'thumbnailUrl'
      | 'duration'
      | 'durationType'
      | 'minimumQualifications'
      | 'metaTitle'
      | 'metaDescription'
      | 'metaKeywords'
      | 'branchIds'
    >
  > {
  slug: string;
  tagline: string | null;
  shortDescription: string | null;
  description: string | null;
  thumbnailFileId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  durationType: DurationType | null;
  minimumQualifications: CourseQualification[];
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  branchIds: string[];
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
