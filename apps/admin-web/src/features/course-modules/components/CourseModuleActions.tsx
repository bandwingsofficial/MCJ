"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModuleActionsProps {
  module: CourseModule;

  onEdit: (
    module: CourseModule
  ) => void;

  onMove: (
    module: CourseModule
  ) => void;

  onDelete: (
    module: CourseModule
  ) => void;

  onRestore: (
    module: CourseModule
  ) => void;
}

export function CourseModuleActions({
  module,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseModuleActionsProps) {
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
            onEdit(module),
        },
        {
          label: "Move",
          onClick: () =>
            onMove(module),
        },
        ...(module.isDeleted
          ? [
              {
                label:
                  "Restore",
                onClick:
                  () =>
                    onRestore(
                      module
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
                      module
                    ),
              },
            ]),
      ]}
    />
  );
}