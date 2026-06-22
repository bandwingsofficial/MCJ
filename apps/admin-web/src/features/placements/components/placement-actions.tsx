"use client";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  Placement,
} from "@/src/features/placements/types/placement.types";

interface PlacementActionsProps {
  placement: Placement;

  onView: (
    placement: Placement,
  ) => void;

  onEdit: (
    placement: Placement,
  ) => void;
}

export function PlacementActions({
  placement,
  onView,
  onEdit,
}: PlacementActionsProps) {
  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
        >
          Actions
        </Button>
      }
      items={[
        {
          label: "View Details",
          onClick: () =>
            onView(
              placement,
            ),
        },
        {
          label: "Update Placement",
          onClick: () =>
            onEdit(
              placement,
            ),
        },
      ]}
    />
  );
}