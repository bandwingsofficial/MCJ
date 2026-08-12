export class CreateCourseModuleCommand {
  constructor(
    public readonly courseId: string,
    public readonly title: string,
    public readonly description?: string,
    public readonly keySkills?: string[],
    public readonly thumbnailUrl?: string,
    public readonly duration?: number,
    public readonly createdBy?: string,
  ) {}
}
