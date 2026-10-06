import { ResourceType } from '../../domain/enums/resource-type.enum';

export class CreateCourseResourceCommand {
  constructor(
    public readonly lessonId: string | undefined,
    public readonly moduleId: string | undefined,
    public readonly title: string,
    public readonly type?: ResourceType,
    public readonly fileUrl?: string,
    public readonly createdBy?: string,
  ) {}
}
