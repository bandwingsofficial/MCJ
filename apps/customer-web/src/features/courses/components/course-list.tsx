"use client";

import { CourseCard } from "@/src/features/courses/components/course-card";

import type {
  Course,
} from "@/src/features/courses/types/course.types";

interface CourseListProps {
  courses: Course[];

  onCourseClick?: (
    course: Course
  ) => void;
}

export function CourseList({
  courses,
  onCourseClick,
}: CourseListProps) {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6

        sm:grid-cols-2

        xl:grid-cols-3

        items-stretch
      "
    >
      {courses.map((course) => (
        <div
          key={course.id}
          className="h-full"
        >
          <CourseCard
            course={course}
            onClick={
              onCourseClick
            }
          />
        </div>
      ))}
    </div>
  );
}