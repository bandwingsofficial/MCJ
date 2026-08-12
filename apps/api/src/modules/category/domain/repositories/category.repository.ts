import { Category } from '../entities/category.entity';
import { CategoryStatus } from '../enums/category-status.enum';

export interface CategoryListFilters {
  branchId?: string;
  status?: CategoryStatus;
  search?: string;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  skip?: number;
  take?: number;
}

export interface CategoryRepository {
  save(category: Category): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Category | null>;

  findBySlug(
    slug: string,
    branchId?: string | null,
    includeDeleted?: boolean,
  ): Promise<Category | null>;

  findAll(
    filters?: CategoryListFilters,
  ): Promise<Category[]>;

  deletePermanent(id: string): Promise<void>;

  // Display Order Methods
  getMaxDisplayOrder(
    branchId?: string | null,
  ): Promise<number>;
  getMaxActiveDisplayOrder(
  branchId?: string | null,
): Promise<number>;

  incrementDisplayOrdersFrom(
    displayOrder: number,
    branchId?: string | null,
  ): Promise<void>;

  shiftDisplayOrders(
  oldOrder: number,
  newOrder: number,
  branchId?: string | null,
): Promise<void>;

closeDisplayOrderGap(
  deletedDisplayOrder: number,
  branchId?: string | null,
): Promise<void>;
}