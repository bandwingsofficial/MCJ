"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isArchived: boolean;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function ModuleContentStatusBadge({ isArchived }: Props) {
  return (
    <Badge
      variant={isArchived ? "danger" : "success"}
      className={compactClass}
    >
      {isArchived ? "Inactive" : "Active"}
    </Badge>
  );
}
