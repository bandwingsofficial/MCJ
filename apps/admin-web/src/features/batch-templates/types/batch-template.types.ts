import type { BatchMode, DayOfWeek } from "@/src/features/batches/types/batch.types";

export type BatchTemplate = {
  id: string;
  name: string;
  mode: BatchMode;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  hasFixedTime: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  displayOrder: number | null;
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
