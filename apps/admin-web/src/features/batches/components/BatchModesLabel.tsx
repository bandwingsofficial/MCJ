"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { Batch } from "@/src/features/batches/types/batch.types";
import {
  formatBatchModesLabel,
  getBatchModes,
  getBatchModeLabel,
} from "@/src/features/batches/utils/batch-mode.utils";

interface Props {
  batch: Batch;
}

export function BatchModesLabel({ batch }: Props) {
  const modes = getBatchModes(batch);

  if (modes.length <= 1) {
    const mode = modes[0] ?? batch.mode;
    return <Badge variant="default">{getBatchModeLabel(mode)}</Badge>;
  }

  return (
    <span className="text-sm leading-snug text-[#102A56]">
      {formatBatchModesLabel(batch)}
    </span>
  );
}
