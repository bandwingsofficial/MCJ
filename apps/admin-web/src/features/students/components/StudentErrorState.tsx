"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";

interface Props {
  error: string;

  onRetry: () => void;
}

export function StudentErrorState({
  error,
  onRetry,
}: Props) {
  return (
    <ErrorState
      title="Failed to load students"
      description={error}
      onRetry={onRetry}
    />
  );
}