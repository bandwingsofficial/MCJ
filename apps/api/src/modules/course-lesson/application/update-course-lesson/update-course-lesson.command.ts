import { LessonContentType } from '../../domain/enums/lesson-content-type.enum';

export class UpdateCourseLessonCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly videoUrl?: string | null,
    public readonly duration?: number | null,
    public readonly contentType?: LessonContentType,
    public readonly updatedBy?: string,
  ) {}
}
