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

export interface BranchAssignableTrainer {
  id: string;
  status: string;
  isDeleted: boolean;
}

export type BranchTrainerAssignmentType =
  | 'BRANCH_ONLY'
  | 'COURSE_BATCH';

export interface BranchTrainerAssignmentRecord {
  id: string;
  branchId: string;
  trainerId: string;
  assignmentType: BranchTrainerAssignmentType;
  courseId: string | null;
  batchId: string | null;
  mode: string | null;
  batchTimingId: string | null;
  trainer: {
    id: string;
    firstName: string;
    lastName: string | null;
    employeeCode: string | null;
    qualification: string | null;
    specialization: string | null;
    status: string;
    profileImageUrl: string | null;
    email: string | null;
    isDeleted: boolean;
  };
  course: {
    id: string;
    title: string;
    code: string;
  } | null;
  batch: {
    id: string;
    name: string;
    code: string;
  } | null;
  batchTiming: {
    id: string;
    name: string;
    mode: string;
    startTime: string;
    endTime: string;
    startDate: Date;
    endDate: Date | null;
    status: string;
  } | null;
}

export interface CourseBatchTrainerAssignmentContext {
  courseId: string;
  batchId: string;
  mode: string;
  batchTimingId: string;
}

export interface BranchAssignableBatch {
  id: string;
  isActive: boolean;
  isDeleted: boolean;
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

  findBySlug(slug: string): Promise<Branch | null>;

  findBySlugIncludingDeleted(
    slug: string,
  ): Promise<Branch | null>;

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

  findByIdOrSlugIncludingDeleted(
    identifier: string,
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

  findTrainersByIds(
    trainerIds: string[],
  ): Promise<BranchAssignableTrainer[]>;

  assignTrainersToBranch(
    branchId: string,
    trainerIds: string[],
  ): Promise<number>;

  assignCourseBatchTrainersToBranch(
    branchId: string,
    trainerIds: string[],
    context: CourseBatchTrainerAssignmentContext,
  ): Promise<number>;

  listBranchTrainerAssignments(
    branchId: string,
  ): Promise<BranchTrainerAssignmentRecord[]>;

  unassignTrainerFromBranch(
    branchId: string,
    trainerId: string,
  ): Promise<void>;

  unassignBranchTrainerAssignment(
    branchId: string,
    assignmentId: string,
  ): Promise<void>;

  findAssignedTrainerIdsForCourseBatchContext(
    branchId: string,
    context: CourseBatchTrainerAssignmentContext,
  ): Promise<string[]>;

  validateCourseBatchTrainerContext(
    branchId: string,
    context: CourseBatchTrainerAssignmentContext,
  ): Promise<void>;

  findBatchesByIds(
    batchIds: string[],
  ): Promise<BranchAssignableBatch[]>;

  assignBatchesToBranch(
    branchId: string,
    batchIds: string[],
  ): Promise<number>;

  unassignBatchFromBranch(
    branchId: string,
    batchId: string,
  ): Promise<void>;

  linkCoursesForAssignedBatches(
    branchId: string,
    batchIds: string[],
  ): Promise<void>;

  syncCourseLinksAfterBatchUnassign(
    branchId: string,
    batchId: string,
  ): Promise<void>;

  findCourseBranchLinksAtBranch(
    branchId: string,
    courseIds: string[],
  ): Promise<
    Map<
      string,
      { linkedViaManual: boolean; linkedViaBatch: boolean }
    >
  >;
}
