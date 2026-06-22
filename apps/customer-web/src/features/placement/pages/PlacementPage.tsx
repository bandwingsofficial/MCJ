"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import { PlacementCard } from "@/src/features/placement/components/placementcard";
import { PlacementEmpty } from "@/src/features/placement/components/PlacementEmpty";
import { PlacementSkeleton } from "@/src/features/placement/components/PlacementSkeleton";
import { usePlacement } from "@/src/features/placement/hooks/usePlacement";

export function PlacementPage() {
  const {
    placement,
    isLoading,
    error,
    refetch,
  } = usePlacement();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Placement"
          description="View your placement details."
        />

        <PlacementSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Placement"
        description={error}
        onRetry={refetch}
      />
    );
  }

  if (!placement) {
    return <PlacementEmpty />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Placement"
        description="View your placement details."
      />

      <PlacementCard
        placement={placement}
      />
    </div>
  );
}