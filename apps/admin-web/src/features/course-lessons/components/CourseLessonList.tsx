"use client";

import { CourseLessonCard } from "@/src/features/course-lessons/components/CourseLessonCard";

import type {
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface CourseLessonListProps {
  lessons: CourseLesson[];

  onEdit: (
    lesson: CourseLesson,
  ) => void;

  onMove: (
    lesson: CourseLesson,
  ) => void;

  onDelete: (
    lesson: CourseLesson,
  ) => void;

  onRestore: (
    lesson: CourseLesson,
  ) => void;
}

export function CourseLessonList({
  lessons,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseLessonListProps) {
  return (
    <div className="space-y-4">
      {lessons.map((lesson) => (
        <CourseLessonCard
          key={lesson.id}
          lesson={lesson}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}