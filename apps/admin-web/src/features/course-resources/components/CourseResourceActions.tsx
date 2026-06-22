"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CourseResource,
} from "@/src/features/course-resources/types";

interface CourseResourceActionsProps {
  resource: CourseResource;

  onEdit: (
    resource: CourseResource,
  ) => void;

  onMove: (
    resource: CourseResource,
  ) => void;

  onDelete: (
    resource: CourseResource,
  ) => void;

  onRestore: (
    resource: CourseResource,
  ) => void;
}

export function CourseResourceActions({
  resource,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseResourceActionsProps) {
  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
        >
          Actions
        </Button>
      }
      items={[
        {
          label: "Edit",
          onClick: () =>
            onEdit(resource),
        },
        {
          label: "Move",
          onClick: () =>
            onMove(resource),
        },
        ...(resource.isDeleted
          ? [
              {
                label:
                  "Restore",
                onClick:
                  () =>
                    onRestore(
                      resource,
                    ),
              },
            ]
          : [
              {
                label:
                  "Delete",
                onClick:
                  () =>
                    onDelete(
                      resource,
                    ),
              },
            ]),
      ]}
    />
  );
}