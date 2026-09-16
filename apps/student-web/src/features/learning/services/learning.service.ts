import { learningApi } from "@/src/features/learning/api/learning.api";

import type {
  CourseCompletionDto,
  CourseProgressDto,
  EnrollmentDetailDto,
  LessonDetailPayloadDto,
  ModuleTreeDto,
  StudentCoursePayloadDto,
  StudentCourseSummaryDto,
  StudentLessonQuizDto,
  StudentProfileDto,
  StudentQuizSubmitResultDto,
  StudentQuizValidateAnswerDto,
} from "@/src/features/learning/types/learning.types";

import { isValidLearningEnrollmentStatus } from "@/src/features/access/utils/student-access";

class LearningService {
  async getStudentProfile(): Promise<StudentProfileDto | null> {
    const response = await learningApi.getStudentProfile();
    return response.data.data;
  }

  async listCourses(): Promise<StudentCourseSummaryDto[]> {
    const response = await learningApi.listCourses();
    return response.data.data ?? [];
  }

  async getMyEnrollments(): Promise<EnrollmentDetailDto[]> {
    const response = await learningApi.getMyEnrollments();
    return (response.data.data ?? []).filter((enrollment) =>
      isValidLearningEnrollmentStatus(enrollment.status),
    );
  }

  async getCourse(courseId: string): Promise<StudentCoursePayloadDto> {
    const response = await learningApi.getCourse(courseId);
    return response.data.data;
  }

  async getModule(
    courseId: string,
    moduleId: string,
  ): Promise<ModuleTreeDto> {
    const response = await learningApi.getModule(courseId, moduleId);
    return response.data.data;
  }

  async getLesson(
    courseId: string,
    lessonId: string,
  ): Promise<LessonDetailPayloadDto> {
    const response = await learningApi.getLesson(courseId, lessonId);
    return response.data.data;
  }

  async getCourseProgress(courseId: string): Promise<CourseProgressDto> {
    const response = await learningApi.getCourseProgress(courseId);
    return response.data.data;
  }

  async getCourseCompletion(
    courseId: string,
  ): Promise<CourseCompletionDto> {
    const response = await learningApi.getCourseCompletion(courseId);
    return response.data.data;
  }

  async markLessonComplete(courseId: string, lessonId: string) {
    const response = await learningApi.updateLessonProgress(
      courseId,
      lessonId,
      { isCompleted: true },
    );
    return response.data.data;
  }

  async updateWatchedSeconds(
    courseId: string,
    lessonId: string,
    watchedSeconds: number,
  ) {
    const response = await learningApi.updateLessonProgress(
      courseId,
      lessonId,
      { watchedSeconds },
    );
    return response.data.data;
  }

  async downloadResource(resourceId: string, courseId: string) {
    const response = await learningApi.downloadResource(resourceId, courseId);
    return response.data.data;
  }

  async getLessonQuiz(
    courseId: string,
    lessonId: string,
  ): Promise<StudentLessonQuizDto> {
    const response = await learningApi.getLessonQuiz(courseId, lessonId);
    return response.data.data;
  }

  async submitLessonQuiz(
    courseId: string,
    lessonId: string,
    answers: Array<{
      questionId: string;
      selectedOptionIds: string[];
    }>,
  ): Promise<StudentQuizSubmitResultDto> {
    const response = await learningApi.submitLessonQuiz(courseId, lessonId, {
      answers,
    });
    return response.data.data;
  }

  async validateLessonQuizAnswer(
    courseId: string,
    lessonId: string,
    payload: {
      questionId: string;
      selectedOptionIds: string[];
    },
  ): Promise<StudentQuizValidateAnswerDto> {
    const response = await learningApi.validateLessonQuizAnswer(
      courseId,
      lessonId,
      payload,
    );
    return response.data.data;
  }
}

export const learningService = new LearningService();
