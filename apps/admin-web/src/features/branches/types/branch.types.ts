export type BranchStatus = "ACTIVE" | "INACTIVE";

export type BranchFilterStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export interface Branch {
  id: string;

  branchName: string;

  branchCode: string;

  email: string | null;

  phone: string | null;

  addressLine1: string | null;

  addressLine2: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  postalCode: string | null;

  latitude: number | null;

  longitude: number | null;

  status: BranchStatus;

  description: string | null;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface BranchListItem {
  id: string;

  branchName: string;

  branchCode: string;

  email: string | null;

  phone: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  status: BranchStatus;

  displayOrder?: number | null;

  deletedAt?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateBranchRequest {
  branchName: string;

  branchCode: string;

  email: string;

  phone: string;

  addressLine1: string;

  addressLine2?: string;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  latitude: number;

  longitude: number;

  description?: string;
}

export interface UpdateBranchRequest {
  branchName?: string;

  branchCode?: string;

  email?: string;

  phone?: string;

  description?: string;

  addressLine1?: string;

  addressLine2?: string;

  city?: string;

  state?: string;

  country?: string;

  postalCode?: string;

  latitude?: number;

  longitude?: number;
}

export interface UpdateBranchStatusRequest {
  status: BranchStatus;
}

export interface BranchFilters {
  search?: string;

  status?: BranchFilterStatus;

  /** Optional for non-Branch callers (e.g. trainers). Not shown in Branch filter UI. */
  includeDeleted?: boolean;

  page?: number;

  pageSize?: number;
}

export interface BranchListResponse {
  items: BranchListItem[];

  count: number;

  meta?: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface SuggestBranchCodeResponse {
  branchCode: string;
  prefix: string;
}

export interface CheckBranchAvailabilityResponse {
  branchCodeAvailable: boolean | null;
  branchNameAvailable: boolean | null;
  branchCodeMessage: string | null;
  branchNameMessage: string | null;
}

export interface ApiResponse<T> {
  success?: boolean;

  message: string;

  data: T;
}
