"use client";

import { useQuery } from "@tanstack/react-query";

import { learningService } from "@/src/features/learning/services/learning.service";
import { getCourseContentMetrics } from "@/src/features/learning/utils/course-metrics.utils";
import {
  getStartedDate,
  resolveCourseTabStatus,
} from "@/src/features/learning/utils/course-status.utils";
import {
  buildProgressMap,
  findContinueLesson,
  getCourseProgressStats,
} from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";

export const learningQueryKeys = {
  courses: ["learning", "courses"] as const,
  enrollments: ["learning", "enrollments"] as const,
  course: (courseId: string) => ["learning", "course", courseId] as const,
  module: (courseId: string, moduleId: string) =>
    ["learning", "course", courseId, "module", moduleId] as const,
  lesson: (courseId: string, lessonId: string) =>
    ["learning", "course", courseId, "lesson", lessonId] as const,
  progress: (courseId: string) =>
    ["learning", "course", courseId, "progress"] as const,
  completion: (courseId: string) =>
    ["learning", "course", courseId, "completion"] as const,
  dashboard: ["learning", "dashboard"] as const,
};

export function useLearningDashboard() {
  return useQuery({
    queryKey: learningQueryKeys.dashboard,
    queryFn: async () => {
      const [courses, enrollments] = await Promise.all([
        learningService.listCourses(),
        learningService.getMyEnrollments(),
      ]);

      const courseDetails = await Promise.all(
        courses.map((course) => learningService.getCourse(course.courseId)),
      );

      const completions = await Promise.all(
        courses.map((course) =>
          learningService.getCourseCompletion(course.courseId),
        ),
      );

      const enrollmentByCourseId = Object.fromEntries(
        enrollments.map((enrollment) => [enrollment.course.id, enrollment]),
      );

      return courses.map((course, index) => {
        const detail = courseDetails[index];
        const completion = completions[index];
        const enrollment = enrollmentByCourseId[course.courseId] ?? null;
        const progressMap = buildProgressMap(detail.progress.items);
        const stats = getCourseProgressStats(
          detail.course.modules,
          detail.progress,
        );
        const continueLesson = findContinueLesson(
          detail.course.modules,
          progressMap,
        );
        const tabStatus = resolveCourseTabStatus({
          progress: detail.progress,
          completion,
          enrollment,
        });

        return {
          course,
          courseDetail: detail.course,
          enrollment,
          progress: detail.progress,
          completion,
          stats,
          metrics: getCourseContentMetrics(detail.course),
          tabStatus,
          startedDate: getStartedDate(enrollment, detail.progress),
          continueLessonPath: continueLesson
            ? getLessonLearningPath(course.courseId, continueLesson.id)
            : `/student/learning/${course.courseId}`,
        };
      });
    },
  });
}

export function useStudentCourse(courseId: string) {
  return useQuery({
    queryKey: learningQueryKeys.course(courseId),
    queryFn: () => learningService.getCourse(courseId),
    enabled: Boolean(courseId),
  });
}

export function useStudentModule(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: learningQueryKeys.module(courseId, moduleId),
    queryFn: () => learningService.getModule(courseId, moduleId),
    enabled: Boolean(courseId && moduleId),
  });
}

export function useStudentLesson(courseId: string, lessonId: string) {
  return useQuery({
    queryKey: learningQueryKeys.lesson(courseId, lessonId),
    queryFn: () => learningService.getLesson(courseId, lessonId),
    enabled: Boolean(courseId && lessonId),
  });
}

export function useCourseCompletion(courseId: string) {
  return useQuery({
    queryKey: learningQueryKeys.completion(courseId),
    queryFn: () => learningService.getCourseCompletion(courseId),
    enabled: Boolean(courseId),
  });
}
