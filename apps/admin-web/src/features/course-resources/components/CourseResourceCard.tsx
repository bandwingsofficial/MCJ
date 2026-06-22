"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import { CourseResourceActions } from "@/src/features/course-resources/components/CourseResourceActions";

import type {
  CourseResource,
} from "@/src/features/course-resources/types";

interface CourseResourceCardProps {
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

export function CourseResourceCard({
  resource,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseResourceCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {resource.displayOrder}.{" "}
              {resource.title}
            </h3>

            <Badge
              variant={
                resource.isDeleted
                  ? "danger"
                  : "success"
              }
            >
              {resource.type}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground break-all">
            {resource.fileUrl}
          </p>
        </div>

        <CourseResourceActions
          resource={resource}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </div>
    </Card>
  );
}