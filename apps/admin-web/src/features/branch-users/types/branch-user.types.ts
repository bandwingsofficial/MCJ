// src/features/branch-users/types/branch-user.types.ts

export type BranchUserFilterStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "DELETED";

export type BranchUserRole =
  | "BRANCH_MANAGER"
  | "RECEPTIONIST"
  | "ACCOUNTANT"
  | "FACULTY_COORDINATOR"
  | "COUNSELOR"
  | "STAFF";

export interface BranchUser {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  role: BranchUserRole;

  permissions: string[];

  branchId: string;

  branchName: string;

  branchCode: string;

  isActive: boolean;

  isDeleted?: boolean;

  lastLoginAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface BranchUserDetails extends BranchUser {
  createdBy: string;

  updatedBy: string;
}

export interface CreateBranchUserRequest {
  firstName: string;

  lastName: string;

  email: string;

  phone: string;

  password: string;

  role: BranchUserRole;

  permissions: string[];

  branchId: string;
}

export interface UpdateBranchUserRequest {
  firstName?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  role?: BranchUserRole;

  permissions?: string[];

  branchId?: string;
}

export interface BranchUserListItem {
  id: string;

  firstName: string;

  lastName: string;
  
  email: string;

  phone: string;

  role: BranchUserRole;

  permissions: string[];

  branchId: string;

  branchCode: string;

  branchName: string;
  
  isActive: boolean;

  isDeleted?: boolean;

  lastLoginAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface BranchUserListResponse {
  items: BranchUserListItem[];

  count: number;
}

export interface BranchUserFilters {
  branchId?: string;

  search: string;

  role?: BranchUserRole;

  status?: BranchUserFilterStatus;

  page: number;

  pageSize: number;
}

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message?: string;

  errors?: Record<string, string[]>;

  meta?: Record<string, string>;
}

export interface ActivateBranchUserResponse {
  id: string;

  firstName: string;

  email: string;

  branchId: string;

  isActive: boolean;

  updatedAt: string;
}

export interface DeactivateBranchUserResponse {
  id: string;

  firstName: string;

  email: string;

  branchId: string;

  isActive: boolean;

  updatedAt: string;
}

export interface RestoreBranchUserResponse {
  id: string;

  firstName: string;

  email: string;

  branchId: string;

  isActive: boolean;

  updatedAt: string;
}