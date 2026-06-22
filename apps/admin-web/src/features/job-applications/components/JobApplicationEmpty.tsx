import {
  EmptyState,
} from "@/src/shared/components/ui/empty-state";

export function JobApplicationEmpty() {
  return (
    <EmptyState
      title="No Job Applications"
      description="No job applications have been submitted yet."
    />
  );
}