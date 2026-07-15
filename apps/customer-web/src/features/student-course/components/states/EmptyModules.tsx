import {
  EmptyState,
} from "@/src/shared/components/ui/empty-state";

export function EmptyModules() {
  return (
    <EmptyState
      title="No Modules Available"
      description="Learning modules have not been added to this course yet."
    />
  );
}