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

export interface BatchTemplateRepository {
  findById(id: string): Promise<BatchTemplateRecord | null>;
  findByIds(ids: string[]): Promise<BatchTemplateRecord[]>;
  list(params?: {
    isActive?: boolean;
  }): Promise<BatchTemplateRecord[]>;
  create(input: CreateBatchTemplateInput): Promise<BatchTemplateRecord>;
  update(
    id: string,
    input: UpdateBatchTemplateInput,
  ): Promise<BatchTemplateRecord>;
  getMaxDisplayOrder(): Promise<number>;
}
