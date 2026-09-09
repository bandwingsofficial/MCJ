"use client";

import { use } from "react";

import { BranchBatchManagePage } from "@/src/features/branch-ops/pages/branch-batch-manage-page";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export default function BatchManageRoute({ params }: PageProps) {
  const { batchId } = use(params);

  return <BranchBatchManagePage batchId={batchId} />;
}
