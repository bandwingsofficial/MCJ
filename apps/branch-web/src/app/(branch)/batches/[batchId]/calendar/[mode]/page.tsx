"use client";

import { use } from "react";

import { BranchBatchModeCalendarPage } from "@/src/features/branch-ops/pages/branch-batch-mode-calendar-page";

interface PageProps {
  params: Promise<{ batchId: string; mode: string }>;
}

export default function BatchCalendarRoute({ params }: PageProps) {
  const { batchId, mode } = use(params);

  return <BranchBatchModeCalendarPage batchId={batchId} modeParam={mode} />;
}
