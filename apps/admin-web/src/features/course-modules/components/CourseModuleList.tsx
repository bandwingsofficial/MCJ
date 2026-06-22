"use client";

import { CourseModuleCard } from "@/src/features/course-modules/components/CourseModuleCard";
import { CourseModuleEmpty } from "@/src/features/course-modules/components/CourseModuleEmpty";

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModuleListProps {
  courseId: string;

  modules: CourseModule[];

  onCreate?: () => void;

  onEdit: (
    module: CourseModule,
  ) => void;

  onMove: (
    module: CourseModule,
  ) => void;

  onDelete: (
    module: CourseModule,
  ) => void;

  onRestore: (
    module: CourseModule,
  ) => void;
}

export function CourseModuleList({
  courseId,
  modules,
  onCreate,
  onEdit,
  onMove,
  onDelete,
  onRestore,
}: CourseModuleListProps) {
  if (
    modules.length === 0
  ) {
    return (
      <CourseModuleEmpty
        onCreate={onCreate}
      />
    );
  }

  return (
    <div className="space-y-4">
      {modules.map(
        (module) => (
          <CourseModuleCard
            key={module.id}
            courseId={courseId}
            module={module}
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