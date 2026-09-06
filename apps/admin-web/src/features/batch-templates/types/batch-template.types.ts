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

export type ApiSuccessResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
