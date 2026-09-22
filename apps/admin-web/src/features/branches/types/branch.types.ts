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

  thumbnailUrl: string | null;

  slug: string;

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

  postalCode: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  status: BranchStatus;

  slug: string;

  thumbnailUrl: string | null;

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

  thumbnailFileId?: string;
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

  thumbnailFileId?: string | null;
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

export interface BulkBranchItemResult {
  branchId: string;
  success: boolean;
  message: string;
  status?: BranchStatus;
}

export interface BulkBranchOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkBranchItemResult[];
  failures: BulkBranchItemResult[];
}

export type BranchTrainerAssignmentType = "BRANCH_ONLY" | "COURSE_BATCH";

export interface BranchTrainerAssignment {
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
    startDate: string;
    endDate: string | null;
    status: string;
  } | null;
}

export interface AssignBranchTrainersPayload {
  assignmentType: BranchTrainerAssignmentType;
  trainerIds: string[];
  courseId?: string;
  batchId?: string;
  mode?: string;
  batchTimingId?: string;
}
