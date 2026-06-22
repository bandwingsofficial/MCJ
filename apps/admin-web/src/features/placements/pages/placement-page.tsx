"use client";

import { useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import { PlacementDetailsDrawer } from "@/src/features/placements/components/placement-details-drawer";
import { PlacementEmpty } from "@/src/features/placements/components/placement-empty";
import { PlacementSkeleton } from "@/src/features/placements/components/placement-skeleton";
import { PlacementTable } from "@/src/features/placements/components/placement-table";
import { UpdatePlacementModal } from "@/src/features/placements/components/update-placement-dialog";

import { usePlacements } from "@/src/features/placements/hooks/usePlacements";
import { useUpdatePlacement } from "@/src/features/placements/hooks/useUpdatePlacement";

import type {
  Placement,
  UpdatePlacementRequest,
} from "@/src/features/placements/types/placement.types";

export function PlacementPage() {
  const {
    placements,
    isLoading,
    error,
    refetch,
  } = usePlacements();

  const {
    updatePlacement,
    isUpdating,
  } = useUpdatePlacement();

  const [
    selectedPlacement,
    setSelectedPlacement,
  ] = useState<Placement | null>(
    null,
  );

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [
    updateOpen,
    setUpdateOpen,
  ] = useState(false);

  const handleView = (
    placement: Placement,
  ) => {
    setSelectedPlacement(
      placement,
    );

    setDetailsOpen(true);
  };

  const handleEdit = (
    placement: Placement,
  ) => {
    setSelectedPlacement(
      placement,
    );

    setUpdateOpen(true);
  };

  const handleUpdate =
    async (
      payload: UpdatePlacementRequest,
    ) => {
      if (!selectedPlacement) {
        return false;
      }

      const response =
        await updatePlacement(
          selectedPlacement.id,
          payload,
        );

      if (!response) {
        return false;
      }

      await refetch();

      return true;
    };

  return (
    <>
      <PageHeader
        title="Placements"
        description="Manage student placements."
      />

      {isLoading && (
        <PlacementSkeleton />
      )}

      {!isLoading &&
        error && (
          <ErrorState
            title="Failed To Load Placements"
            description={
              error
            }
            onRetry={
              refetch
            }
          />
        )}

      {!isLoading &&
        !error &&
        placements.length ===
          0 && (
          <PlacementEmpty />
        )}

      {!isLoading &&
        !error &&
        placements.length >
          0 && (
          <PlacementTable
            placements={
              placements
            }
            onView={
              handleView
            }
            onEdit={
              handleEdit
            }
          />
        )}

      <PlacementDetailsDrawer
        open={detailsOpen}
        placement={
          selectedPlacement
        }
        onClose={() =>
          setDetailsOpen(
            false,
          )
        }
      />

      <UpdatePlacementModal
        open={updateOpen}
        placement={
          selectedPlacement
        }
        isSubmitting={
          isUpdating
        }
        onClose={() =>
          setUpdateOpen(
            false,
          )
        }
        onSubmit={
          handleUpdate
        }
      />
    </>
  );
}