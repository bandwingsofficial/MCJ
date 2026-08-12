import { ResourceType } from '../../domain/enums/resource-type.enum';

export class UpdateCourseResourceCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly type?: ResourceType,
    public readonly fileUrl?: string | null,
    public readonly updatedBy?: string,
  ) {}
}
