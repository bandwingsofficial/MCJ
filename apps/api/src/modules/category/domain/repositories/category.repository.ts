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

  findByNameInsensitive(
    name: string,
    branchId?: string | null,
    includeDeleted?: boolean,
  ): Promise<Category | null>;

  findAll(
    filters?: CategoryListFilters,
  ): Promise<Category[]>;

  count(filters?: CategoryListFilters): Promise<number>;

  countBlockingReferences(id: string): Promise<{
    courses: number;
    enrollments: number;
    articles: number;
  }>;

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

  /**
   * Move one ordered category to a new display order inside a transaction.
   */
  moveDisplayOrder(
    categoryId: string,
    oldOrder: number,
    newOrder: number,
    branchId?: string | null,
  ): Promise<void>;

  /**
   * Persist a contiguous 1..n display order for the given IDs
   * (non-archived / ordered categories only). Runs in a transaction.
   */
  reorderOrderedCategories(
    orderedIds: string[],
    branchId?: string | null,
  ): Promise<void>;
}