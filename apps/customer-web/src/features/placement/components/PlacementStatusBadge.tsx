"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface PlacementStatusBadgeProps {
  status: string;
}

const badgeVariant = (
  status: string,
):
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "default" => {
  switch (
    status.toUpperCase()
  ) {
    case "PLACED":
    case "JOINED":
    case "ACCEPTED":
      return "success";

    case "PENDING":
      return "warning";

    case "REJECTED":
      return "danger";

    default:
      return "default";
  }
};

export function PlacementStatusBadge({
  status,
}: PlacementStatusBadgeProps) {
  return (
    <Badge
      variant={badgeVariant(
        status,
      )}
    >
      {status}
    </Badge>
  );
}