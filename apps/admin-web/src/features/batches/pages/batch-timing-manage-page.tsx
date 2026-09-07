"use client";

import { useState } from "react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { useBatchTiming } from "@/src/features/batches/hooks/useBatchTiming";
import { BatchTimingManageHeader } from "@/src/features/batches/components/timing-manage/batch-timing-manage-header";
import {
  BATCH_TIMING_MANAGE_TABS,
  BatchTimingManageWorkspace,
  type BatchTimingManageTabKey,
} from "@/src/features/batches/components/timing-manage/batch-timing-manage-workspace";

interface Props {
  batchId: string;
  timingId: string;
}

const TAB_LABELS = Object.fromEntries(
  BATCH_TIMING_MANAGE_TABS.map(({ value, label }) => [value, label]),
) as Record<BatchTimingManageTabKey, string>;

export function BatchTimingManagePage({ batchId, timingId }: Props) {
  const { timing, batch, isLoading, error, refetch } = useBatchTiming(
    batchId,
    timingId,
  );
  const [activeSection, setActiveSection] = useState<string | undefined>(
    TAB_LABELS.overview,
  );

  if (isLoading) {
    return <Loader />;
  }

  if (error || !timing || !batch) {
    return (
      <ErrorState
        title="Batch Timing Not Found"
        description={error ?? "Unable to load this batch timing."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-full min-w-0">
      <BatchTimingManageHeader
        batch={batch}
        timing={timing}
        activeSection={activeSection}
      />

      <div className="mt-4">
        <BatchTimingManageWorkspace
          batch={batch}
          timing={timing}
          onTabChange={(tab) => {
            setActiveSection(TAB_LABELS[tab]);
          }}
          onTimingUpdated={() => {
            void refetch();
          }}
        />
      </div>
    </div>
  );
}
