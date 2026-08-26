// src/modules/branch/domain/repositories/branch.repository.ts

import { Branch } from '../entities/branch.entity';
import { BranchStatus } from '../enums/branch-status.enum';

export interface BranchListFilters {
  status?: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface BranchAssignableCourse {
  id: string;
  status: string;
  isDeleted: boolean;
}

export interface BranchBlockingReferences {
  branchUsers: number;
  students: number;
  trainers: number;
  enrollments: number;
  batches: number;
  categories: number;
  courseBranches: number;
}

export interface BranchRepository {
  save(branch: Branch): Promise<void>;

  delete(branchId: string): Promise<void>;

  deletePermanent(branchId: string): Promise<void>;

  countBlockingReferences(
    branchId: string,
  ): Promise<BranchBlockingReferences>;

  getManagementCounts(branchId: string): Promise<{
    students: number;
    courses: number;
    batches: number;
    enrollments: number;
    instructors: number;
    categories: number;
  }>;

  findById(id: string): Promise<Branch | null>;

  findByBranchCode(
    branchCode: string,
  ): Promise<Branch | null>;

  findByBranchNameInsensitive(
    branchName: string,
    excludeId?: string,
  ): Promise<Branch | null>;

  findAll(
    filters?: BranchListFilters,
  ): Promise<Branch[]>;

  count(filters?: BranchListFilters): Promise<number>;

  findByIdIncludingDeleted(
    id: string,
  ): Promise<Branch | null>;

  existsById(id: string): Promise<boolean>;

  existsByBranchCode(
    branchCode: string,
    excludeId?: string,
  ): Promise<boolean>;

  getMaxNumericSuffixForPrefix(
    prefix: string,
  ): Promise<number>;

  getMaxDisplayOrder(): Promise<number>;

  getMaxActiveDisplayOrder(): Promise<number>;

  closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void>;

  moveDisplayOrder(
    branchId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;

  updateEmail(
    branchId: string,
    email: string | null,
  ): Promise<void>;

  updatePhone(
    branchId: string,
    phone: string | null,
  ): Promise<void>;

  updateLocation(
    branchId: string,
    params: {
      latitude?: number | null;
      longitude?: number | null;
    },
  ): Promise<void>;

  updateAddress(
    branchId: string,
    params: {
      addressLine1?: string | null;
      addressLine2?: string | null;

      city?: string | null;
      state?: string | null;
      country?: string | null;

      postalCode?: string | null;
    },
  ): Promise<void>;

  updateStatus(
    branchId: string,
    status: BranchStatus,
  ): Promise<void>;

  findCoursesByIds(
    courseIds: string[],
  ): Promise<BranchAssignableCourse[]>;

  assignCoursesToBranch(
    branchId: string,
    courseIds: string[],
  ): Promise<number>;

  unassignCourseFromBranch(
    branchId: string,
    courseId: string,
  ): Promise<void>;
}
