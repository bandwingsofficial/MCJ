"use client";

import { CourseResourceCard } from "@/src/features/course-resources/components/CourseResourceCard";
import { CourseResourceEmpty } from "@/src/features/course-resources/components/CourseResourceEmpty";

import type {
  CourseResource,
} from "@/src/features/course-resources/types";

interface CourseResourceListProps {
  resources: CourseResource[];

  onCreate?: () => void;

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

export function CourseResourceList({
  resources,
  onCreate,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseResourceListProps) {
  if (
    resources.length === 0
  ) {
    return (
      <CourseResourceEmpty
        onCreate={onCreate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {resources.map(
        (resource) => (
          <CourseResourceCard
            key={resource.id}
            resource={resource}
            onEdit={onEdit}
            onMove={onMove}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        ),
      )}
    </div>
  );
}