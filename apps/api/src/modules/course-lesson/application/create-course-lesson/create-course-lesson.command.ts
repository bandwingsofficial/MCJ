import { LessonContentType } from '../../domain/enums/lesson-content-type.enum';

export class CreateCourseLessonCommand {
  constructor(
    public readonly moduleId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly videoUrl?: string,
    public readonly duration?: number,
    public readonly contentType?: LessonContentType,
    public readonly parentLessonId?: string | null,
    public readonly createdBy?: string,
  ) {}
}
