export class StudentCourseSummaryResult {
  constructor(
    public readonly courseId: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly thumbnailUrl: string | null,
    public readonly level: string,
    public readonly language: string,
    public readonly enrollmentId: string,
    public readonly enrollmentNumber: string,
    public readonly enrollmentStatus: string,
    public readonly batchId: string,
    public readonly batchName: string,
  ) {}
}

export class StudentCourseProgressItemResult {
  constructor(
    public readonly lessonId: string,
    public readonly isCompleted: boolean,
    public readonly watchedSeconds: number,
    public readonly completedAt: Date | null,
  ) {}
}

export class StudentCourseProgressResult {
  constructor(
    public readonly courseId: string,
    public readonly totalLessons: number,
    public readonly completedLessons: number,
    public readonly completionPercentage: number,
    public readonly items: StudentCourseProgressItemResult[],
  ) {}
}

export class StudentCourseCompletionResult {
  constructor(
    public readonly courseId: string,
    public readonly totalLessons: number,
    public readonly completedLessons: number,
    public readonly completionPercentage: number,
    public readonly isCourseCompleted: boolean,
    public readonly certificateEligible: boolean,
  ) {}
}
