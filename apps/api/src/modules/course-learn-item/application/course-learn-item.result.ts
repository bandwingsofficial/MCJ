export class CourseLearnItemResult {
  constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public readonly title: string,
    public readonly explanation: string,
    public readonly imageUrl: string | null,
    public readonly keyLearningPoints: string | null,
    public readonly finalThoughts: string | null,
    public readonly summary: string | null,
    public readonly displayOrder: number,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}
}
