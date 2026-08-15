import { apiClient } from "@/src/core/api/axios";

import type {
  CourseQuizDetailResponse,
  CourseQuizListResponse,
  CourseQuizQuestion,
  CourseQuizQuestionResponse,
  CourseQuizResponse,
  CreateCourseQuizRequest,
  CreateQuizQuestionRequest,
  GetCourseQuizzesRequest,
  ReorderQuizQuestionsRequest,
  UpdateCourseQuizRequest,
  UpdateQuizQuestionRequest,
} from "@/src/features/course-quizzes/types/course-quiz.types";

class CourseQuizService {
  private readonly basePath = "/admin/course-quizzes";
  private readonly questionBasePath = "/admin/course-quiz-questions";

  async getCourseQuizzes(filters: GetCourseQuizzesRequest) {
    const { data } = await apiClient.get<CourseQuizListResponse>(
      this.basePath,
      {
        params: {
          lessonId: filters.lessonId,
          includeDeleted: filters.includeDeleted,
        },
      },
    );

    return data;
  }

  async getCourseQuiz(id: string) {
    const { data } = await apiClient.get<CourseQuizDetailResponse>(
      `${this.basePath}/${id}`,
    );

    return data;
  }

  async createCourseQuiz(payload: CreateCourseQuizRequest) {
    const { data } = await apiClient.post<CourseQuizResponse>(
      this.basePath,
      payload,
    );

    return data;
  }

  async updateCourseQuiz(id: string, payload: UpdateCourseQuizRequest) {
    const { data } = await apiClient.patch<CourseQuizResponse>(
      `${this.basePath}/${id}`,
      payload,
    );

    return data;
  }

  async deleteCourseQuiz(id: string) {
    const { data } = await apiClient.delete<CourseQuizResponse>(
      `${this.basePath}/${id}`,
    );

    return data;
  }

  async publishCourseQuiz(id: string) {
    const { data } = await apiClient.patch<CourseQuizResponse>(
      `${this.basePath}/${id}/publish`,
    );

    return data;
  }

  async createQuizQuestion(quizId: string, payload: CreateQuizQuestionRequest) {
    const { data } = await apiClient.post<CourseQuizQuestionResponse>(
      `${this.basePath}/${quizId}/questions`,
      payload,
    );

    return data;
  }

  async updateQuizQuestion(
    questionId: string,
    payload: UpdateQuizQuestionRequest,
  ) {
    const { data } = await apiClient.patch<CourseQuizQuestionResponse>(
      `${this.questionBasePath}/${questionId}`,
      payload,
    );

    return data;
  }

  async deleteQuizQuestion(questionId: string) {
    const { data } = await apiClient.delete<CourseQuizQuestionResponse>(
      `${this.questionBasePath}/${questionId}`,
    );

    return data;
  }

  async reorderQuizQuestions(
    quizId: string,
    payload: ReorderQuizQuestionsRequest,
  ) {
    const { data } = await apiClient.patch<{
      success: boolean;
      message: string;
      data: CourseQuizQuestion[];
    }>(`${this.basePath}/${quizId}/questions/reorder`, payload);

    return data;
  }
}

export const courseQuizService = new CourseQuizService();
