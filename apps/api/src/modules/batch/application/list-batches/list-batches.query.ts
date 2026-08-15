import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchStatus } from '../../domain/enums/batch-status.enum';

export class ListBatchesQuery {
  constructor(
    public readonly courseId?: string,
    public readonly branchId?: string,
    public readonly trainerId?: string,
    public readonly mode?: CourseMode,
    public readonly status?: BatchStatus,
    public readonly search?: string,
    public readonly isFeatured?: boolean,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
