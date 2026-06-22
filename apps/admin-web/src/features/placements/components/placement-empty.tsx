import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function PlacementEmpty() {
  return (
    <EmptyState
      title="No Placements Found"
      description="No placement records are available."
    />
  );
}