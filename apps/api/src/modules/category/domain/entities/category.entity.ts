import { CategoryStatus } from '../enums/category-status.enum';
import { CategoryName } from '../value-objects/category-name.vo';
import { Slug } from '../value-objects/slug.vo';

export class Category {
  private constructor(
    public readonly id: string,
    public name: CategoryName,
    public slug: Slug,
    public description: string | null,
    public thumbnailFileId: string | null,
    public thumbnailUrl: string | null,
    public status: CategoryStatus,
    public displayOrder: number | null,
    public branchId: string | null,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: {
    id: string;
    name: string;
    slug?: string;
    description?: string | null;
    thumbnailFileId?: string | null;
    thumbnailUrl?: string | null;
    status?: CategoryStatus;
    displayOrder?: number | null;
    branchId?: string | null;
    createdBy?: string | null;
  }): Category {
    return new Category(
      params.id,
      CategoryName.create(params.name),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromName(params.name),
      params.description ?? null,
      params.thumbnailFileId ?? null,
      params.thumbnailUrl ?? null,
      params.status ?? CategoryStatus.ACTIVE,
      params.displayOrder ?? null,
      params.branchId ?? null,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    thumbnailFileId: string | null;
    thumbnailUrl: string | null;
    status: CategoryStatus;
    displayOrder: number | null;
    branchId: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    isDeleted: boolean;
    deletedAt: Date | null;
    deletedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return new Category(
      params.id,
      CategoryName.create(params.name),
      Slug.create(params.slug),
      params.description,
      params.thumbnailFileId,
      params.thumbnailUrl,
      params.status,
      params.displayOrder,
      params.branchId,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: {
    name?: string;
    slug?: string;
    description?: string | null;
    thumbnailFileId?: string | null;
    thumbnailUrl?: string | null;
    displayOrder?: number | null;
    branchId?: string | null;
    updatedBy?: string | null;
  }) {
    if (params.name !== undefined) {
      this.name = CategoryName.create(params.name);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromName(params.name);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.description !== undefined) {
      this.description = params.description;
    }

    if (params.thumbnailFileId !== undefined) {
      this.thumbnailFileId = params.thumbnailFileId;
    }

    if (params.thumbnailUrl !== undefined) {
      this.thumbnailUrl = params.thumbnailUrl;
    }

    if (params.displayOrder !== undefined) {
      this.displayOrder = params.displayOrder;
    }

    if (params.branchId !== undefined) {
      this.branchId = params.branchId;
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.status = CategoryStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.status = CategoryStatus.INACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.status = CategoryStatus.ARCHIVED;
    this.displayOrder = null;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = CategoryStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
