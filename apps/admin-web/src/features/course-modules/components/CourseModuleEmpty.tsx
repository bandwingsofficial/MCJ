"use client";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface CourseModuleEmptyProps {
  onCreate?: () => void;
}

export function CourseModuleEmpty({
  onCreate,
}: CourseModuleEmptyProps) {
  return (
    <EmptyState
      title="No Modules Found"
      description="Create your first course module to get started."
      action={
        onCreate ? (
          <Button onClick={onCreate}>
            Create Module
          </Button>
        ) : undefined
      }
    />
  );
}