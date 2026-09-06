import type { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import type { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export type BatchTemplateRecord = {
  id: string;
  name: string;
  mode: CourseMode;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  hasFixedTime: boolean;
  isActive: boolean;
  displayOrder: number | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBatchTemplateInput = {
  name: string;
  mode: CourseMode;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  hasFixedTime: boolean;
  isActive?: boolean;
  createdBy?: string;
};

export type UpdateBatchTemplateInput = {
  name?: string;
  mode?: CourseMode;
  daysOfWeek?: DayOfWeek[];
  startTime?: string | null;
  endTime?: string | null;
  hasFixedTime?: boolean;
  isActive?: boolean;
  updatedBy?: string;
};

export type ListBatchTemplatesParams = {
  search?: string;
  mode?: CourseMode;
  isActive?: boolean;
  /** When true, only archived. When false/undefined with includeDeleted false, exclude archived. */
  isDeleted?: boolean;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
};

export type ListBatchTemplatesResult = {
  items: BatchTemplateRecord[];
  total: number;
  catalogTotal: number;
};

export interface BatchTemplateRepository {
  findById(id: string): Promise<BatchTemplateRecord | null>;
  findByIds(ids: string[]): Promise<BatchTemplateRecord[]>;
  list(params?: ListBatchTemplatesParams): Promise<ListBatchTemplatesResult>;
  create(input: CreateBatchTemplateInput): Promise<BatchTemplateRecord>;
  update(
    id: string,
    input: UpdateBatchTemplateInput,
  ): Promise<BatchTemplateRecord>;
  softDelete(id: string, deletedBy?: string): Promise<BatchTemplateRecord>;
  restore(id: string, updatedBy?: string): Promise<BatchTemplateRecord>;
  permanentDelete(id: string): Promise<void>;
  softDeleteMany(ids: string[], deletedBy?: string): Promise<number>;
  restoreMany(ids: string[], updatedBy?: string): Promise<number>;
  permanentDeleteMany(ids: string[]): Promise<number>;
  setActiveMany(ids: string[], isActive: boolean): Promise<number>;
  getMaxDisplayOrder(): Promise<number>;
}
