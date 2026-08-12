export interface LessonProgressRecord {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  watchedSeconds: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonProgressRepository {
  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<LessonProgressRecord[]>;
  findByStudentAndLesson(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgressRecord | null>;
  upsert(params: {
    studentId: string;
    courseId: string;
    lessonId: string;
    isCompleted?: boolean;
    watchedSeconds?: number;
  }): Promise<LessonProgressRecord>;
}
