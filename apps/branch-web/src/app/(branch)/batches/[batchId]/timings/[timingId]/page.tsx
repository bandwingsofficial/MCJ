"use client";

import { use } from "react";

import { BranchBatchTimingManagePage } from "@/src/features/branch-ops/pages/branch-batch-manage-page";

interface PageProps {
  params: Promise<{ batchId: string; timingId: string }>;
}

export default function BatchTimingManageRoute({ params }: PageProps) {
  const { batchId, timingId } = use(params);

  return <BranchBatchTimingManagePage batchId={batchId} timingId={timingId} />;
}
