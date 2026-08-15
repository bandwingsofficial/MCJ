"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isArchived: boolean;
}

export function ModuleContentStatusBadge({ isArchived }: Props) {
  return (
    <Badge
      variant={isArchived ? "danger" : "success"}
      className="px-2.5 py-0.5 text-sm"
    >
      {isArchived ? "Inactive" : "Active"}
    </Badge>
  );
}
