import { ResourceType } from '../domain/enums/resource-type.enum';

export class CourseResourceResult {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly title: string,
    public readonly type: ResourceType,
    public readonly fileUrl: string | null,
    public readonly displayOrder: number,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
