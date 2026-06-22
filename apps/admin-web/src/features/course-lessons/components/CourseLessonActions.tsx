"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CourseLesson,
} from "@/src/features/course-lessons/types";

interface CourseLessonActionsProps {
  lesson: CourseLesson;

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

export function CourseLessonActions({
  lesson,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseLessonActionsProps) {
  return (
    <Dropdown
      trigger={
        <Button variant="outline">
          Actions
        </Button>
      }
      items={[
        {
          label: "Edit",
          onClick: () =>
            onEdit(lesson),
        },
        {
          label: "Move",
          onClick: () =>
            onMove(lesson),
        },
        ...(lesson.isDeleted
          ? [
              {
                label: "Restore",
                onClick: () =>
                  onRestore(
                    lesson,
                  ),
              },
            ]
          : [
              {
                label: "Delete",
                onClick: () =>
                  onDelete(
                    lesson,
                  ),
              },
            ]),
      ]}
    />
  );
}