"use client";

import { useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { useBatch } from "@/src/features/batches/hooks/useBatch";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import {
  BATCH_MODE_MANAGE_TABS,
  BatchModeManageWorkspace,
  type BatchModeManageTabKey,
} from "@/src/features/batches/components/mode-manage/batch-mode-manage-workspace";
import { BatchModeManageHeader } from "@/src/features/batches/components/mode-manage/batch-mode-manage-header";

interface Props {
  batchId: string;
  mode: BatchMode;
}

const TAB_LABELS = Object.fromEntries(
  BATCH_MODE_MANAGE_TABS.map(({ value, label }) => [value, label]),
) as Record<BatchModeManageTabKey, string>;

export function BatchModeManagePage({ batchId, mode }: Props) {
  const { batch, isLoading, error, refetch } = useBatch(batchId);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    TAB_LABELS.overview,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !batch) {
    return (
      <ErrorState
        title="Batch Not Found"
        description={error ?? "Unable to load this batch."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-full min-w-0">
      <BatchModeManageHeader
        batch={batch}
        mode={mode}
        activeSection={activeSection}
      />

      <div className="mt-4">
        <BatchModeManageWorkspace
          batch={batch}
          mode={mode}
          onTabChange={(tab) => {
            setActiveSection(TAB_LABELS[tab]);
          }}
        />
      </div>
    </div>
  );
}
