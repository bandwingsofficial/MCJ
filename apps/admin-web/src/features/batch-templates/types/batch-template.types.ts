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

export type CreateBatchesFromTemplatesRequest = {
  courseId: string;
  startDate: string;
  endDate: string;
  templateIds: string[];
  name?: string;
  capacity?: number;
  durationValue?: number;
  durationType?: string;
  originalPrice?: number;
  discountAmount?: number;
  discountedPrice?: number;
  currency?: string;
  isFree?: boolean;
};

export type CreateBatchesFromTemplatesResult = {
  createdCount: number;
  failedCount: number;
  results: Array<{
    templateId: string;
    templateName: string;
    success: boolean;
    error?: string;
  }>;
};

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
