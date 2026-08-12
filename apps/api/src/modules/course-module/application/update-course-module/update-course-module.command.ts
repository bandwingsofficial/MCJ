export class UpdateCourseModuleCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly keySkills?: string[],
    public readonly thumbnailUrl?: string | null,
    public readonly duration?: number | null,
    public readonly updatedBy?: string,
  ) {}
}
