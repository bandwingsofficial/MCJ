export type QuizStatus = "DRAFT" | "PUBLISHED";

export type QuizQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "MULTIPLE_SELECT";

export interface CourseQuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}

export interface CourseQuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  type: QuizQuestionType;
  explanation: string | null;
  points: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  options: CourseQuizOption[];
}

export interface CourseQuiz {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  passingScore: number | null;
  timeLimitMinutes: number | null;
  displayOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseQuizDetail extends CourseQuiz {
  questions: CourseQuizQuestion[];
}

export interface CreateCourseQuizRequest {
  lessonId: string;
  title: string;
  description?: string;
  passingScore?: number;
  timeLimitMinutes?: number;
}

export interface UpdateCourseQuizRequest {
  title?: string;
  description?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  displayOrder?: number;
}

export interface CreateQuizQuestionOptionRequest {
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export interface CreateQuizQuestionRequest {
  questionText: string;
  type?: QuizQuestionType;
  explanation?: string;
  points?: number;
  options: CreateQuizQuestionOptionRequest[];
}

export interface UpdateQuizQuestionRequest {
  questionText?: string;
  type?: QuizQuestionType;
  explanation?: string | null;
  points?: number;
  options?: CreateQuizQuestionOptionRequest[];
}

export interface ReorderQuizQuestionsRequest {
  questionIds: string[];
}

export interface GetCourseQuizzesRequest {
  lessonId: string;
  includeDeleted?: boolean;
}

export interface CourseQuizResponse {
  success: boolean;
  message: string;
  data: CourseQuiz;
}

export interface CourseQuizDetailResponse {
  success: boolean;
  message: string;
  data: CourseQuizDetail;
}

export interface CourseQuizListResponse {
  success: boolean;
  message: string;
  data: CourseQuiz[];
}

export interface CourseQuizQuestionResponse {
  success: boolean;
  message: string;
  data: CourseQuizQuestion;
}

export interface CourseQuizFormValues {
  title: string;
  description: string;
  passingScore: string;
  timeLimitMinutes: string;
}

export interface QuizQuestionFormValues {
  questionText: string;
  type: QuizQuestionType;
  explanation: string;
  points: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
}
