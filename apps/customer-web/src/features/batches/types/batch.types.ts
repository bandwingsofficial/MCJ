export type BatchMode =
  | "ONLINE"
  | "OFFLINE"
  | "RECORDED";

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

export interface BatchPricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent?: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

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

export interface Batch {
  id: string;

  name: string;

  code: string;

  slug: string;

  description: string | null;

  course: BatchCourse;

  branch: BatchBranch | null;

  courseId: string;

  branchId: string | null;

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

  /** Batch-level fee. Prefer nested `pricing`; flat fields supported for API compatibility. */
  pricing?: BatchPricing | null;
  originalPrice?: number;
  discountAmount?: number;
  discountPercent?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;

  isFeatured: boolean;

  status: BatchStatus;

  trainers: BatchTrainer[];

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}