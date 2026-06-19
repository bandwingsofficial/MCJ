// src/features/batches/types/batch.types.ts

/* ---------------------------------- */
/* Enums                              */
/* ---------------------------------- */

export type BatchMode =
  | "ONLINE"
  | "OFFLINE"
  | "HYBRID";

export type BatchStatus =
  | "UPCOMING"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/* ---------------------------------- */
/* Related Models                     */
/* ---------------------------------- */

export interface BatchCourse {
  id: string;
  title: string;
}

export interface BatchBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface BatchTrainer {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

/* ---------------------------------- */
/* Batch Model                        */
/* ---------------------------------- */

export interface Batch {
  id: string;

  name: string;

  code: string;

  slug: string;

  description: string | null;

  courseId: string;

  branchId: string | null;

  course?: BatchCourse | null;

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

  trainers: BatchTrainer[];

  createdBy: string;

  updatedBy: string | null;

  createdAt: string;

  updatedAt: string;

  isDeleted: boolean;

  deletedAt: string | null;
}

/* ---------------------------------- */
/* Create DTO                         */
/* ---------------------------------- */

export interface CreateBatchRequest {
  name: string;

  code: string;

  description?: string;

  courseId: string;

  branchId?: string;

  startDate: string;

  endDate?: string;

  startTime: string;

  endTime: string;

  daysOfWeek: DayOfWeek[];

  capacity: number;

  enrolledCount?: number;

  mode: BatchMode;

  classroom?: string;

  meetingLink?: string;

  isFeatured?: boolean;

  trainerIds?: string[];
}

/* ---------------------------------- */
/* Update DTO                         */
/* ---------------------------------- */

export interface UpdateBatchRequest
  extends Partial<CreateBatchRequest> {}

/* ---------------------------------- */
/* API Response                       */
/* ---------------------------------- */

export interface BatchResponse {
  success: boolean;

  message: string;

  data: Batch;
}

export interface BatchListResponse {
  success: boolean;

  message: string;

  data: Batch[];
}

/* ---------------------------------- */
/* Delete Response                    */
/* ---------------------------------- */

export interface DeleteBatchResponse {
  success: boolean;

  message: string;

  data: {
    id: string;
    deleted: boolean;
    deletedAt: string;
  };
}

/* ---------------------------------- */
/* Permanent Delete Response          */
/* ---------------------------------- */

export interface PermanentDeleteBatchResponse {
  success: boolean;

  message: string;

  data: {
    id: string;
    permanentlyDeleted: boolean;
  };
}
/* ---------------------------------- */
/* Dropdown Option Models             */
/* ---------------------------------- */

export interface CourseOption {
  id: string;

  title: string;
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

/* ---------------------------------- */
/* Dropdown Responses                 */
/* ---------------------------------- */

export interface CourseListResponse {
  success: boolean;

  message: string;

  data: CourseOption[];
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

  status: string;

  createdAt: string;

  updatedAt: string;
}

export interface BranchListResponse {
  success: boolean;

  message: string;

  data: {
    items: BranchListItem[];

    count: number;
  };
}

export interface TrainerListResponse {
  success: boolean;

  message: string;

  data: TrainerOption[];
}