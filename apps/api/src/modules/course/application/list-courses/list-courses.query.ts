import { CourseStatus } from '../../domain/enums/course-status.enum';

export class ListCoursesQuery {
  constructor(
    public readonly categoryId?: string,
    public readonly branchId?: string,
    public readonly status?: CourseStatus,
    public readonly search?: string,
    public readonly isFeatured?: boolean,
    public readonly isPopular?: boolean,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
