export type BranchStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface Branch {
  id: string;

  branchName: string;

  branchCode: string;

  email: string;

  phone: string;

  addressLine1: string;

  addressLine2: string | null;

  city: string;

  state: string;

  country: string;

  postalCode: string;

  latitude: number;

  longitude: number;

  status: BranchStatus;

  description: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface BranchListItem {
  id: string;

  branchName: string;

  branchCode: string;

  email: string;

  phone: string;

  city: string;

  state: string;

  country: string;

  status: BranchStatus;

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

  status?: BranchStatus;

  includeDeleted?: boolean;
}

export interface BranchListResponse {
  items: BranchListItem[];

  count: number;
}

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}