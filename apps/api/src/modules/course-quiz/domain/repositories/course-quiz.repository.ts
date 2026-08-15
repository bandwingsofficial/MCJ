import { CourseQuiz } from '../entities/course-quiz.entity';
import { CourseQuizQuestion } from '../entities/course-quiz-question.entity';

export interface CourseQuizListFilters {
  lessonId?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface CourseQuizRepository {
  save(quiz: CourseQuiz): Promise<void>;

  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<CourseQuiz | null>;

  findByLessonId(
    lessonId: string,
    includeDeleted?: boolean,
  ): Promise<CourseQuiz | null>;

  findAll(
    filters?: CourseQuizListFilters,
  ): Promise<CourseQuiz[]>;

  deletePermanent(id: string): Promise<void>;

  saveQuestion(question: CourseQuizQuestion): Promise<void>;

  findQuestionById(id: string): Promise<CourseQuizQuestion | null>;

  findQuestionsByQuizId(quizId: string): Promise<CourseQuizQuestion[]>;

  deleteQuestion(id: string): Promise<void>;

  getMaxQuestionDisplayOrder(quizId: string): Promise<number>;

  closeQuestionDisplayOrderGap(
    quizId: string,
    deletedDisplayOrder: number,
  ): Promise<void>;

  reorderQuestions(
    quizId: string,
    orderedIds: string[],
  ): Promise<void>;
}
