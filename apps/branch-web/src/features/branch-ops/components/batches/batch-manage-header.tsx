"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  courseTitle,
  formatBatchDate,
  formatBatchStatus,
  formatLearningModes,
  getBatchDisplayStatus,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  batch: BatchListItem;
  parentLabel: string;
}

export function BatchManageHeader({ batch, parentLabel }: Props) {
  const display = getBatchDisplayStatus(batch);

  return (
    <div className="space-y-3">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/dashboard" className="text-[#647A9B] hover:text-[#2563EB]">
          {parentLabel}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link href="/batches" className="text-[#647A9B] hover:text-[#2563EB]">
          My Batches
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-[#102A56]">{batch.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#E1EBF5] bg-white p-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-[#102A56]">
            {batch.name}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            {courseTitle(batch.course)} ·{" "}
            {formatLearningModes(batch.learningModes, batch.mode)}
          </p>
        </div>
        <Badge variant={display.variant}>{display.label}</Badge>
      </div>

      <p className="text-sm text-[#647A9B]">
        {formatBatchDate(batch.startDate)} – {formatBatchDate(batch.endDate)} ·{" "}
        {formatBatchStatus(batch.status)}
      </p>
    </div>
  );
}
