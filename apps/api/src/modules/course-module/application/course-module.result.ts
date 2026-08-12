export class CourseModuleResult {
  constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly keySkills: string[],
    public readonly thumbnailUrl: string | null,
    public readonly duration: number | null,
    public readonly displayOrder: number,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
