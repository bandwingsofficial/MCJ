"use client";

import { useRouter } from "next/navigation";

import { Dropdown } from "@/src/shared/components/ui/dropdown";
import { Button } from "@/src/shared/components/ui/button";

import {
  CourseListItem,
} from "@/src/features/courses/types/course.types";

interface Props {
  course: CourseListItem;

  onView: (
    course: CourseListItem
  ) => void;

  onEdit: (
    course: CourseListItem
  ) => void;

  onDelete: (
    course: CourseListItem
  ) => void;

  onRestore: (
    course: CourseListItem
  ) => void;

  onActivate: (
    course: CourseListItem
  ) => void;

  onDeactivate: (
    course: CourseListItem
  ) => void;

  onPermanentDelete: (
    course: CourseListItem
  ) => void;
}

export function CourseActions({
  course,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onActivate,
  onDeactivate,
  onPermanentDelete,
}: Props) {
  const router =
    useRouter();

  const items = [
    {
      label: "View",
      onClick: () =>
        onView(course),
    },

    {
      label: "Modules",
      onClick: () =>
        router.push(
          `/courses/${course.id}/modules`
        ),
    },

    {
      label: "Edit",
      onClick: () =>
        onEdit(course),
    },
  ];

  if (
    course.status ===
    "ACTIVE"
  ) {
    items.push({
      label: "Deactivate",
      onClick: () =>
        onDeactivate(
          course
        ),
    });
  }

  if (
    course.status ===
      "INACTIVE" ||
    course.status ===
      "DRAFT"
  ) {
    items.push({
      label: "Activate",
      onClick: () =>
        onActivate(
          course
        ),
    });
  }

  if (
    course.status !==
    "ARCHIVED"
  ) {
    items.push({
      label: "Delete",
      onClick: () =>
        onDelete(course),
    });
  }

  if (
    course.status ===
    "ARCHIVED"
  ) {
    items.push(
      {
        label: "Restore",
        onClick: () =>
          onRestore(
            course
          ),
      },
      {
        label:
          "Permanent Delete",
        onClick: () =>
          onPermanentDelete(
            course
          ),
      }
    );
  }

  return (
    <Dropdown
      trigger={
        <Button variant="outline">
          Actions
        </Button>
      }
      items={items}
    />
  );
}