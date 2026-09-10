"use client";

import type { BatchCalendarSummary } from "@/src/features/batches/types/batch.types";
import { batchCalendarSummaryRows } from "@/src/features/batches/utils/batch-calendar-display.utils";
import { Card } from "@/src/shared/components/ui/card";

interface Props {
  summary: BatchCalendarSummary;
}

export function BatchCalendarSummaryPanel({ summary }: Props) {
  const rows = batchCalendarSummaryRows(summary);

  return (
    <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-6">
      {rows.map((row) => (
        <div key={row.label} className="rounded-xl border border-slate-200 bg-[#F8FBFF] px-3 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {row.label}
          </p>
          <p className="mt-1 text-xl font-semibold text-[#102A56]">{row.value}</p>
        </div>
      ))}
    </Card>
  );
}
