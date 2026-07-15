"use client";

import {
  useMemo,
} from "react";

import { AboutCourse } from "@/src/features/student-course/components/overview/AboutCourse";
import { KeySkills } from "@/src/features/student-course/components/overview/KeySkills";

import { CourseHero } from "@/src/features/student-course/components/header/CourseHero";

import { StudentCourseLayout } from "@/src/features/student-course/components/layout/StudentCourseLayout";

import { CourseProgress } from "@/src/features/student-course/components/progress/CourseProgress";

import { CourseError } from "@/src/features/student-course/components/states/CourseError";
import { CourseSkeleton } from "@/src/features/student-course/components/states/CourseSkeleton";
import { EmptyModules } from "@/src/features/student-course/components/states/EmptyModules";

import { useCoursePlayer } from "@/src/features/student-course/hooks/use-course-player";
import { useStudentCourse } from "@/src/features/student-course/hooks/use-student-course";

interface StudentCoursePageProps {
  courseId: string;
}

export function StudentCoursePage({
  courseId,
}: StudentCoursePageProps) {
  const {
    course,
    isLoading,
    error,
    refetch,
  } =
    useStudentCourse(
      courseId,
    );

  /**
   * Course statistics.
   *
   * Later these should come directly
   * from the backend.
   */
  const {
    totalModules,
    totalLessons,
    totalResources,
  } = useMemo(() => {
    if (!course) {
      return {
        totalModules: 0,
        totalLessons: 0,
        totalResources: 0,
      };
    }

    const totalLessons =
      course.modules.reduce(
        (
          total,
          module,
        ) =>
          total +
          module.lessons.length,
        0,
      );

    const totalResources =
      course.modules.reduce(
        (
          moduleTotal,
          module,
        ) =>
          moduleTotal +
          module.lessons.reduce(
            (
              lessonTotal,
              lesson,
            ) =>
              lessonTotal +
              lesson.resources.length,
            0,
          ),
        0,
      );

    return {
      totalModules:
        course.modules.length,

      totalLessons,

      totalResources,
    };
  }, [course]);

  /**
   * Course player.
   */
  const {
    selectedLesson,
    selectedLessonId,
    hasPreviousLesson,
    hasNextLesson,
    selectLesson,
    goToPreviousLesson,
    goToNextLesson,
  } =
    useCoursePlayer(
      course?.modules ??
        [],
    );

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <CourseSkeleton />
    );
  }

  /**
   * Error State
   */
  if (error || !course) {
    return (
      <CourseError
        message={
          error ??
          "Unable to load the course."
        }
        onRetry={
          refetch
        }
      />
    );
  }

  /**
   * Empty Modules State
   */
  if (
    course.modules.length ===
    0
  ) {
    return (
      <EmptyModules />
    );
  }

  /**
   * Safety check.
   *
   * This should never happen,
   * but prevents runtime crashes.
   */
 if (
  !selectedLesson ||
  !selectedLessonId
) {
  return (
    <CourseSkeleton />
  );
}
}
