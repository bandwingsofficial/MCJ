"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

interface Props {
  module: Pick<CourseModule, "isDeleted" | "deletedAt">;
}

export function CourseModuleStatusBadge({ module }: Props) {
  const isArchived = Boolean(module.isDeleted || module.deletedAt);

  return (
    <Badge
      variant={isArchived ? "danger" : "success"}
      className="px-2.5 py-0.5 text-sm"
    >
      {isArchived ? "Inactive" : "Active"}
    </Badge>
  );
}
