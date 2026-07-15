"use client";

import {
  ErrorState,
} from "@/src/shared/components/ui/error-state";

interface CourseErrorProps {
  message: string;

  onRetry: () => void;
}

export function CourseError({
  message,
  onRetry,
}: CourseErrorProps) {
  return (
    <ErrorState
      title="Unable to Load Course"
      description={message}
      onRetry={onRetry}
    />
  );
}