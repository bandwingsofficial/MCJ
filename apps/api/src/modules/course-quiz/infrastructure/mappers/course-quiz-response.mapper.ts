import { CourseQuiz } from '../../domain/entities/course-quiz.entity';
import { CourseQuizQuestion } from '../../domain/entities/course-quiz-question.entity';
import { CourseQuizOption } from '../../domain/entities/course-quiz-option.entity';
import {
  CourseQuizDetailResult,
  CourseQuizOptionResult,
  CourseQuizQuestionResult,
  CourseQuizResult,
} from '../../application/course-quiz.result';

export class CourseQuizResponseMapper {
  static toResult(quiz: CourseQuiz): CourseQuizResult {
    return new CourseQuizResult(
      quiz.id,
      quiz.lessonId,
      quiz.title,
      quiz.description,
      quiz.status,
      quiz.passingScore,
      quiz.timeLimitMinutes,
      quiz.displayOrder,
      quiz.createdBy,
      quiz.updatedBy,
      quiz.isDeleted,
      quiz.deletedAt,
      quiz.createdAt,
      quiz.updatedAt,
    );
  }

  static toDetailResult(
    quiz: CourseQuiz,
    questions: CourseQuizQuestion[],
  ): CourseQuizDetailResult {
    return new CourseQuizDetailResult(
      quiz.id,
      quiz.lessonId,
      quiz.title,
      quiz.description,
      quiz.status,
      quiz.passingScore,
      quiz.timeLimitMinutes,
      quiz.displayOrder,
      quiz.createdBy,
      quiz.updatedBy,
      quiz.isDeleted,
      quiz.deletedAt,
      quiz.createdAt,
      quiz.updatedAt,
      this.toQuestionResultList(questions),
    );
  }

  static toQuestionResult(
    question: CourseQuizQuestion,
  ): CourseQuizQuestionResult {
    return new CourseQuizQuestionResult(
      question.id,
      question.quizId,
      question.questionText,
      question.type,
      question.explanation,
      question.points,
      question.displayOrder,
      question.createdAt,
      question.updatedAt,
      this.toOptionResultList(question.options),
    );
  }

  static toQuestionResultList(
    questions: CourseQuizQuestion[],
  ): CourseQuizQuestionResult[] {
    return questions.map((question) => this.toQuestionResult(question));
  }

  static toOptionResult(option: CourseQuizOption): CourseQuizOptionResult {
    return new CourseQuizOptionResult(
      option.id,
      option.questionId,
      option.optionText,
      option.isCorrect,
      option.displayOrder,
    );
  }

  static toOptionResultList(
    options: CourseQuizOption[],
  ): CourseQuizOptionResult[] {
    return options.map((option) => this.toOptionResult(option));
  }

  static toResultList(quizzes: CourseQuiz[]): CourseQuizResult[] {
    return quizzes.map((quiz) => this.toResult(quiz));
  }
}
