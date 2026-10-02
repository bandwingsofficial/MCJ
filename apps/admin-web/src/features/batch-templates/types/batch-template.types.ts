import type {
  BatchLifecycleStatus,
  BatchMode,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";

export type BatchTemplateLifecycleBlock = {
  batchId: string;
  batchName: string;
  lifecycleStatus: "UPCOMING" | "ONGOING";
};

export type BatchTemplate = {
  id: string;
  name: string;
  mode: BatchMode;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  hasFixedTime: boolean;
  capacity: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  displayOrder: number | null;
  lifecycleBlocks?: BatchTemplateLifecycleBlock[];
  /** Resolved from linked parent Batch(es); null when no linked batch. */
  linkedBatchLifecycleStatus?: BatchLifecycleStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBatchTemplateRequest = {
  name: string;
  mode: BatchMode;
  daysOfWeek?: DayOfWeek[];
  startTime?: string | null;
  endTime?: string | null;
  hasFixedTime?: boolean;
  capacity: number;
  isActive?: boolean;
};

export type UpdateBatchTemplateRequest = Partial<CreateBatchTemplateRequest>;

export type BulkBatchTemplateResult = {
  requested: number;
  succeeded: number;
  failed: number;
};

export type ApiSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
