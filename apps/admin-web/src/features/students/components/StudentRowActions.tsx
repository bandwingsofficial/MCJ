"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import {
  Student,
} from "@/src/features/students/types/student.types";

interface Props {
  student: Student;

  onEdit: (
    id: string
  ) => void;

  onActivate: (
    id: string
  ) => void;

  onDeactivate: (
    id: string
  ) => void;

  onDelete: (
    id: string
  ) => void;

  onView?: (
    id: string
  ) => void;
}

export function StudentRowActions({
  student,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onView,
}: Props) {
  return (
    <Dropdown
      trigger={
        <Button variant="outline">
          Actions
        </Button>
      }
      items={[
        ...(onView
          ? [
              {
                label: "View",
                onClick: () =>
                  onView(student.id),
              },
            ]
          : []),

        {
          label: "Edit",

          onClick: () =>
            onEdit(student.id),
        },

        student.isActive
          ? {
              label: "Deactivate",

              onClick: () =>
                onDeactivate(
                  student.id
                ),
            }
          : {
              label: "Activate",

              onClick: () =>
                onActivate(
                  student.id
                ),
            },

        {
          label: "Delete",

          onClick: () =>
            onDelete(
              student.id
            ),
        },
      ]}
    />
  );
}