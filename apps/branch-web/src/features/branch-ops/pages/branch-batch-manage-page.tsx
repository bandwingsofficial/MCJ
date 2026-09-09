"use client";

import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  BatchTimingManageHeader,
  BatchManageHeader,
} from "@/src/features/branch-ops/components/batches/batch-manage-header";
import {
  BATCH_TIMING_MANAGE_TABS,
  BatchTimingManageWorkspace,
  type BatchTimingManageTabKey,
} from "@/src/features/branch-ops/components/batches/timing-manage/batch-timing-manage-workspace";
import {
  BATCH_MANAGE_TABS,
  BatchManageWorkspace,
  type BatchManageTabKey,
} from "@/src/features/branch-ops/components/batches/manage/batch-manage-workspace";
import { BATCH_MANAGE_DEFAULT_TAB } from "@/src/features/branch-ops/utils/batch-manage.routes";
import { buildBatchSummary } from "@/src/features/branch-ops/utils/batch-summary.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

const BATCH_TAB_LABELS = Object.fromEntries(
  BATCH_MANAGE_TABS.map(({ value, label }) => [value, label]),
) as Record<BatchManageTabKey, string>;

const TIMING_TAB_LABELS = Object.fromEntries(
  BATCH_TIMING_MANAGE_TABS.map(({ value, label }) => [value, label]),
) as Record<BatchTimingManageTabKey, string>;

interface BatchPageProps {
  batchId: string;
}

export function BranchBatchManagePage({ batchId }: BatchPageProps) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batch(batchId),
    [batchId],
  );
  const [activeSection, setActiveSection] = useState<string | undefined>(
    BATCH_TAB_LABELS[BATCH_MANAGE_DEFAULT_TAB],
  );

  const summary = useMemo(
    () => (data ? buildBatchSummary(data) : null),
    [data],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Batch not found." />;

  return (
    <div className="min-h-full min-w-0 space-y-4">
      <BatchManageHeader batch={data} activeSection={activeSection} />
      <BatchManageWorkspace
        batch={data}
        summary={summary}
        onTabChange={(tab) => {
          setActiveSection(BATCH_TAB_LABELS[tab]);
        }}
      />
    </div>
  );
}

interface TimingPageProps {
  batchId: string;
  timingId: string;
}

export function BranchBatchTimingManagePage({
  batchId,
  timingId,
}: TimingPageProps) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batch(batchId),
    [batchId],
  );
  const [activeSection, setActiveSection] = useState<string | undefined>(
    TIMING_TAB_LABELS.overview,
  );

  const timing = useMemo(
    () => data?.timings?.find((item) => item.id === timingId) ?? null,
    [data, timingId],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data || !timing) {
    return (
      <EmptyState
        title="Batch timing not found."
        description="This timing is not linked to the selected batch in your branch."
      />
    );
  }

  return (
    <div className="min-h-full min-w-0 space-y-4">
      <BatchTimingManageHeader
        batch={data}
        timing={timing}
        activeSection={activeSection}
      />
      <BatchTimingManageWorkspace
        batch={data}
        timing={timing}
        onTabChange={(tab) => {
          setActiveSection(TIMING_TAB_LABELS[tab]);
        }}
      />
    </div>
  );
}
