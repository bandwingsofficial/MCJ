"use client";

import Link from "next/link";

import type { Batch, BatchMode } from "@/src/features/batches/types/batch.types";
import {
  batchManagePath,
  batchModeManagePath,
} from "@/src/features/batches/utils/batch-manage.routes";
import { getBatchModeLabel } from "@/src/features/batches/utils/batch-mode.utils";

interface Props {
  batch: Batch;
  mode: BatchMode;
  activeSection?: string;
}

export function BatchModeManageHeader({
  batch,
  mode,
  activeSection,
}: Props) {
  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-[#647A9B]">
        <Link href="/batches" className="hover:text-[#2563EB]">
          Batches
        </Link>
        <span>/</span>
        <Link href={batchManagePath(batch.id)} className="hover:text-[#2563EB]">
          {batch.name}
        </Link>
        <span>/</span>
        <span className="text-[#102A56]">{getBatchModeLabel(mode)}</span>
        <span>/</span>
        <span className="font-medium text-[#102A56]">Management</span>
      </nav>

      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold text-[#102A56]">
          {batch.name}
        </h1>
        <p className="mt-1 text-sm text-[#647A9B]">
          {getBatchModeLabel(mode)}
          {activeSection ? ` · ${activeSection}` : ""}
        </p>
      </div>
    </div>
  );
}
