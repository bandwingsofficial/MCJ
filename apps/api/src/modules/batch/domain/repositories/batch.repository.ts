import { Batch } from '../entities/batch.entity';
import { BatchStatus } from '../enums/batch-status.enum';

export interface BatchListFilters {
  courseId?: string;
  branchId?: string;
  status?: BatchStatus;
  search?: string;
  isFeatured?: boolean;
  includeDeleted?: boolean;
  onlyActive?: boolean;
  skip?: number;
  take?: number;
}

export interface BatchRepository {
  save(batch: Batch): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<Batch | null>;
  findByCode(
    code: string,
    includeDeleted?: boolean,
  ): Promise<Batch | null>;
findBySlug(
  slug: string,
  includeDeleted?: boolean,
): Promise<Batch | null>;

  findAll(filters?: BatchListFilters): Promise<Batch[]>;
  deletePermanent(id: string): Promise<void>;
}
