// src/features/batches/types/batch.types.ts

export type BatchMode = "ONLINE" | "OFFLINE" | "RECORDED";

export type BatchStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "ARCHIVED";

export type BatchFilterStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface BatchCourse {
  id: string;
  title: string;
  code?: string | null;
  tagline?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  minimumQualifications?: string[];
  isFree?: boolean;
  currency?: string;
  discountedPrice?: number | string;
  originalPrice?: number | string;
  category?: BatchCategory | null;
}

export interface BatchCategory {
  id: string;
  name: string;
}

export interface BatchBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface BatchTrainer {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
  specialization?: string | null;
  status?: string;
  profileImageUrl?: string | null;
  email?: string | null;
  qualification?: string | null;
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  courseId: string | null;
  categoryId: string | null;
  branchId: string | null;
  course?: BatchCourse | null;
  category?: BatchCategory | null;
  branch?: BatchBranch | null;
  startDate: string;
  endDate: string | null;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  capacity: number;
  enrolledCount: number;
  mode: BatchMode;
  classroom: string | null;
  meetingLink: string | null;
  isFeatured: boolean;
  isActive?: boolean;
  status: BatchStatus;
  displayOrder?: number | null;
  trainers: BatchTrainer[];
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

export type BatchListItem = Batch;

export interface BatchFilters {
  search?: string;
  courseId?: string;
  branchId?: string;
  trainerId?: string;
  mode?: BatchMode;
  status?: BatchFilterStatus;
  isActive?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface BatchCourseAssignment {
  id: string;
  batchId: string;
  courseId: string;
  trainerId: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  course: BatchCourse;
  trainer: BatchTrainer;
}

export interface AssignBatchCourseRequest {
  courseId: string;
  trainerId: string;
}

export interface CreateBatchRequest {
  name: string;
  code?: string;
  description?: string;
  courseId?: string;
  branchId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  capacity: number;
  enrolledCount?: number;
  mode: BatchMode;
  classroom?: string;
  meetingLink?: string;
  isFeatured?: boolean;
  status?: BatchStatus;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {}

export interface AssignBatchTrainersRequest {
  trainerIds: string[];
}

export interface ReorderBatchRequest {
  batchId: string;
  newDisplayOrder: number;
}

export interface SuggestBatchCodeResponse {
  batchCode: string;
}

export interface BatchSummary {
  batchId: string;
  studentsCount: number;
  trainerCount: number;
  enrolledCount: number;
  capacity: number;
  attendancePresent: number;
  attendanceAbsent: number;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BatchListResponse {
  items: BatchListItem[];
  count: number;
}

export interface DeleteBatchResponse {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export interface PermanentDeleteBatchResponse {
  id: string;
  permanentlyDeleted: boolean;
}

export interface BulkBatchItemResult {
  batchId: string;
  success: boolean;
  message: string;
  isActive?: boolean;
}

export interface BulkBatchOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkBatchItemResult[];
  failures: BulkBatchItemResult[];
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface CourseOption {
  id: string;
  title: string;
  code?: string | null;
  category?: BatchCategory | null;
}

export interface BranchOption {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface TrainerOption {
  id: string;
  firstName: string;
  lastName: string | null;
  employeeCode: string | null;
}

export interface CourseListResponse {
  success: boolean;
  message: string;
  data: {
    items: CourseOption[];
    count: number;
  };
}

export interface BranchListItem {
  id: string;
  branchName: string;
  branchCode: string;
  status: string;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  data: {
    items: BranchListItem[];
    count: number;
  };
}

/** @deprecated Use ApiSuccessResponse */
export interface BatchResponse extends ApiSuccessResponse<Batch> {}

/** @deprecated Use BatchListResponse */
export interface BatchListLegacyResponse extends ApiSuccessResponse<Batch[]> {}
