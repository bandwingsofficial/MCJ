import { Badge } from "@/src/shared/components/ui/badge";

import type {
  PlacementStatus,
} from "@/src/features/placements/types/placement.types";

interface PlacementStatusBadgeProps {
  status: PlacementStatus;
}

const STATUS_VARIANTS: Record<
  PlacementStatus,
  "success" | "warning" | "default"
> = {
  PENDING: "warning",
  JOINED: "success",
};

export function PlacementStatusBadge({
  status,
}: PlacementStatusBadgeProps) {
  return (
    <Badge
      variant={
        STATUS_VARIANTS[status] ??
        "default"
      }
    >
      {status}
    </Badge>
  );
}