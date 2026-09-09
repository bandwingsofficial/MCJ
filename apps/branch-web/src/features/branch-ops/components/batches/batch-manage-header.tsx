"use client";

import Link from "next/link";

import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";
import { courseTitle } from "@/src/features/branch-ops/utils/batch-display";
import { batchManagePath } from "@/src/features/branch-ops/utils/batch-manage.routes";
import type { BatchMode } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { formatTimingRange } from "@/src/features/branch-ops/utils/batch-timing.utils";

interface Props {
  batch: BatchListItem;
  activeSection?: string;
}

export function BatchManageHeader({ batch, activeSection }: Props) {
  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
        <Link
          href="/batches"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Batches
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={batchManagePath(batch.id)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {batch.name}
        </Link>
        <span aria-hidden>›</span>
        <span className="text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-[#102A56] sm:text-2xl">
            {batch.name}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            {batch.code} · {courseTitle(batch.course)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BatchStatusBadge status={batch.status} />
            <BatchModeBadge mode={batch.mode} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimingHeaderProps {
  batch: BatchListItem;
  timing: BatchTimingListItem;
  activeSection?: string;
}

export function BatchTimingManageHeader({
  batch,
  timing,
  activeSection,
}: TimingHeaderProps) {
  const mode = timing.mode as BatchMode;

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
        <Link
          href="/batches"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Batches
        </Link>
        <span aria-hidden>›</span>
        <Link
          href={batchManagePath(batch.id)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {batch.name}
        </Link>
        <span aria-hidden>›</span>
        <BatchModeBadge mode={mode} />
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">{timing.name}</span>
        <span aria-hidden>›</span>
        <span className="text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-[#102A56] sm:text-2xl">
            {timing.name}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            {batch.name} · {batch.code} · {courseTitle(batch.course)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BatchStatusBadge status={timing.status} isActive={timing.isActive} />
            <BatchModeBadge mode={mode} />
            <span className="text-sm text-[#647A9B]">
              {formatTimingRange(timing)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
