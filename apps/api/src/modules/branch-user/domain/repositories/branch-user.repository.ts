import { BranchUser } from '../entities/branch-user.entity';
import { BranchUserRole } from '../enums/branch-user-role.enum';
import { BranchUserEmail } from '../value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../value-objects/branch-user-phone.vo';

export interface BranchUserListFilters {
  branchId?: string;
  role?: BranchUserRole;
  isActive?: boolean;
  search?: string;
  includeDeleted?: boolean;
  isDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface BranchUserRepository {
  save(branchUser: BranchUser): Promise<void>;

  findById(id: string): Promise<BranchUser | null>;

  findByEmail(
    email: BranchUserEmail,
  ): Promise<BranchUser | null>;

  findByPhone(
    phone: BranchUserPhone,
  ): Promise<BranchUser | null>;

  /**
   * Global uniqueness lookup. Includes soft-deleted rows because
   * `email` / `phone` are unique across the whole table.
   */
  findByEmailIncludingDeleted(
    email: BranchUserEmail,
  ): Promise<BranchUser | null>;

  findByPhoneIncludingDeleted(
    phone: BranchUserPhone,
  ): Promise<BranchUser | null>;

  findAll(
    filters?: BranchUserListFilters,
  ): Promise<BranchUser[]>;

  count(
    filters?: BranchUserListFilters,
  ): Promise<number>;

  findByIdIncludingDeleted(
  id: string,
): Promise<BranchUser | null>;

  existsById(id: string): Promise<boolean>;

  existsByEmail(
    email: BranchUserEmail,
  ): Promise<boolean>;

  existsByPhone(
    phone: BranchUserPhone,
  ): Promise<boolean>;

  branchExists(branchId: string): Promise<boolean>;

  runInTransaction<T>(
    work: (repo: BranchUserRepository) => Promise<T>,
  ): Promise<T>;

  permanentDelete(id: string): Promise<void>;

  /**
   * Atomically rotate refresh hash only if the expected current hash still matches.
   */
  rotateRefreshTokenIfMatches(params: {
    branchUserId: string;
    expectedHash: string;
    newHash: string;
    expiresAt: Date;
  }): Promise<boolean>;
}
