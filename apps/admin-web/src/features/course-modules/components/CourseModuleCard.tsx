"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import { CourseModuleActions } from "@/src/features/course-modules/components/CourseModuleActions";

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModuleCardProps {
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

export function CourseModuleCard({
  module,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseModuleCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">
              {module.displayOrder}.{" "}
              {module.title}
            </h3>

            <Badge
              variant={
                module.isDeleted
                  ? "danger"
                  : "success"
              }
            >
              {module.isDeleted
                ? "Deleted"
                : "Active"}
            </Badge>
          </div>

          {module.description && (
            <p className="text-sm text-muted-foreground">
              {module.description}
            </p>
          )}

          {module.keySkills.length >
            0 && (
            <div className="flex flex-wrap gap-2">
              {module.keySkills.map(
                (skill) => (
                  <Badge
                    key={skill}
                    variant="info"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>
          )}
        </div>

        <CourseModuleActions
          module={module}
          onEdit={onEdit}
          onMove={onMove}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </div>
    </Card>
  );
}