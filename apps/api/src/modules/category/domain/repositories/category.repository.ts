import { Category } from '../entities/category.entity';
import { CategoryStatus } from '../enums/category-status.enum';

export interface CategoryListFilters {
  /** When set, only categories assigned to this branch via BranchCategory. */
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
    includeDeleted?: boolean,
  ): Promise<Category | null>;

  findByNameInsensitive(
    name: string,
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
    branches: number;
  }>;

  deletePermanent(id: string): Promise<void>;

  removeBranchAssignments(categoryId: string): Promise<number>;

  assignCategoriesToBranch(
    branchId: string,
    categoryIds: string[],
  ): Promise<number>;

  unassignCategoryFromBranch(
    branchId: string,
    categoryId: string,
  ): Promise<void>;

  isAssignedToBranch(
    categoryId: string,
    branchId: string,
  ): Promise<boolean>;

  // Display Order Methods (global sequence)
  getMaxDisplayOrder(): Promise<number>;
  getMaxActiveDisplayOrder(): Promise<number>;

  incrementDisplayOrdersFrom(displayOrder: number): Promise<void>;

  shiftDisplayOrders(
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;

  closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void>;

  moveDisplayOrder(
    categoryId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;

  reorderOrderedCategories(orderedIds: string[]): Promise<void>;

  normalizeOrderedDisplayOrders(): Promise<void>;
}
