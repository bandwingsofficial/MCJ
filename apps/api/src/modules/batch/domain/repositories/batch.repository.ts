import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';

import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';

export interface BatchListFilters {
  courseId?: string;
  branchId?: string;
  trainerId?: string;
  mode?: CourseMode;
  status?: BatchStatus;
  search?: string;
  isFeatured?: boolean;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  skip?: number;
  take?: number;
}

export interface BatchSummaryCounts {
  studentsCount: number;
  trainerCount: number;
  enrolledCount: number;
  capacity: number;
  attendancePresent: number;
  attendanceAbsent: number;
}

export interface BatchRepository {
  save(batch: Batch): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Batch | null>;
  findByIdIncludingDeleted(id: string): Promise<Batch | null>;
  findByCode(
    code: string,
    includeDeleted?: boolean,
  ): Promise<Batch | null>;
  findBySlug(
    slug: string,
    includeDeleted?: boolean,
  ): Promise<Batch | null>;

  findAll(filters?: BatchListFilters): Promise<Batch[]>;
  count(filters?: BatchListFilters): Promise<number>;
  getMaxDisplayOrder(): Promise<number>;
  getMaxBatchCodeSequence(prefix: string): Promise<number>;
  closeDisplayOrderGap(deletedDisplayOrder: number): Promise<void>;
  moveDisplayOrder(
    batchId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;
  getSummaryCounts(batchId: string): Promise<BatchSummaryCounts>;
  findFirstAssignedCourseId(batchId: string): Promise<string | null>;
  deletePermanent(id: string): Promise<void>;
}
