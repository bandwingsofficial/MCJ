"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModuleActionsProps {
  courseId: string;

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
  courseId,
  module,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseModuleActionsProps) {
  const router =
    useRouter();

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
          label:
            "View Lessons",
          onClick: () =>
            router.push(
              `/courses/${courseId}/modules/${module.id}/lessons`
            ),
        },
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