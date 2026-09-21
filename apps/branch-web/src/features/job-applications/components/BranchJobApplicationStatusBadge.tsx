"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  formatApplicationStatusLabel,
  getApplicationStatusVariant,
} from "@/src/features/job-applications/utils/job-application-display.utils";

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

interface Props {
  status?: string | null;
}

export function BranchJobApplicationStatusBadge({ status }: Props) {
  return (
    <Badge variant={getApplicationStatusVariant(status)} className={compactClass}>
      {formatApplicationStatusLabel(status)}
    </Badge>
  );
}
