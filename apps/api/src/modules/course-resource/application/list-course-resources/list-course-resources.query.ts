import { ResourceType } from '../../domain/enums/resource-type.enum';

export class ListCourseResourcesQuery {
  constructor(
    public readonly lessonId?: string,
    public readonly type?: ResourceType,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
