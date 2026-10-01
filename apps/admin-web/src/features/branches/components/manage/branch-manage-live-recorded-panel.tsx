"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Plus } from "lucide-react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { BranchBatchFiltersBar } from "@/src/features/branches/components/manage/branch-batch-filters";
import {
  BranchLiveRecordedLifecycleTabs,
  type BranchLiveRecordedLifecycleTab,
} from "@/src/features/branches/components/manage/branch-live-recorded-lifecycle-tabs";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import {
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  calculateBranchBatchLifecycleStatus,
  filterBranchBatchesByLifecycle,
  filterBranchBatchesBySearch,
} from "@/src/features/branches/utils/branch-batch-lifecycle.utils";
import { LIVE_RECORDED_GRADIENT_BUTTON_CLASS } from "@/src/features/branches/components/live-recorded/branch-live-recorded-ui.constants";
import { branchLiveRecordedBatchPath } from "@/src/features/branches/utils/branch-live-recorded.routes";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatBatchDateRange } from "@/src/features/batches/utils/batch.helper";
import { getBatchDisplayStatus } from "@/src/features/batches/utils/batch-select.utils";
import { getBatchTimingsCount } from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  branchId: string;
}

const EMPTY_TAB_MESSAGES: Record<BranchLiveRecordedLifecycleTab, string> = {
  ONGOING: "No ongoing batches assigned to this branch.",
  EXPIRED: "No expired batches assigned to this branch.",
};

function countLiveRecordedBatches(
  batches: Batch[],
  now?: Date,
): Record<BranchLiveRecordedLifecycleTab, number> {
  return {
    ONGOING: filterBranchBatchesByLifecycle(batches, "ONGOING", now).length,
    EXPIRED: filterBranchBatchesByLifecycle(batches, "EXPIRED", now).length,
  };
}

export function BranchManageLiveRecordedPanel({ branchId }: Props) {
  const [search, setSearch] = useState("");
  const [lifecycleTab, setLifecycleTab] =
    useState<BranchLiveRecordedLifecycleTab>("ONGOING");
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAllBatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const batchResponse = await batchService.getBatches({
        branchId,
        includeDeleted: false,
        isDeleted: false,
        page: 1,
        pageSize: 100,
      });

      setAllBatches(batchResponse.data.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAllBatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const lifecycleCounts = useMemo(
    () => countLiveRecordedBatches(allBatches),
    [allBatches],
  );

  const batches = useMemo(() => {
    const inTab = filterBranchBatchesByLifecycle(allBatches, lifecycleTab);
    return filterBranchBatchesBySearch(inTab, search);
  }, [allBatches, lifecycleTab, search]);

  return (
    <div className="space-y-3">
      <header className={BRANCH_TAB_HEADER_CLASS}>
        <div className={BRANCH_TAB_HEADER_ROW_CLASS}>
          <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h2 className={BRANCH_TAB_TITLE_CLASS}>Live Recorded Videos</h2>
            <span className={BRANCH_TAB_COUNT_CLASS}>
              Assigned Batches:
              <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                {isLoading
                  ? "—"
                  : lifecycleCounts.ONGOING + lifecycleCounts.EXPIRED}
              </span>
            </span>
          </div>

          <BranchBatchFiltersBar
            search={search}
            onSearchChange={setSearch}
          />
        </div>
      </header>

      <BranchLiveRecordedLifecycleTabs
        value={lifecycleTab}
        counts={lifecycleCounts}
        disabled={isLoading}
        onChange={setLifecycleTab}
      />

      <div className={BRANCH_TABLE_CARD_CLASS}>
        <BranchManageTableShell
          embedded
          columns={[
            { key: "batch", label: "Batch Name" },
            { key: "course", label: "Course" },
            { key: "schedule", label: "Schedule" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[8.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && batches.length === 0}
          emptyTitle={
            lifecycleCounts.ONGOING + lifecycleCounts.EXPIRED === 0
              ? "No Batches Available"
              : "No Batches in This Tab"
          }
          emptyDescription={
            lifecycleCounts.ONGOING + lifecycleCounts.EXPIRED === 0
              ? "Assign ongoing or expired batches to this branch from the Batches tab."
              : EMPTY_TAB_MESSAGES[lifecycleTab]
          }
          emptyIcon={Layers}
        >
          {batches.map((batch) => {
            const displayStatus = getBatchDisplayStatus(batch);
            const lifecycle = calculateBranchBatchLifecycleStatus(batch);
            const isExpiredTab = lifecycle === "EXPIRED";
            const scheduleRange = formatBatchDateRange(
              batch.startDate,
              batch.endDate,
            ).replace(" – ", " → ");
            const timingsCount = getBatchTimingsCount(batch);
            const timingsLabel = `${timingsCount} Batch Timing${
              timingsCount === 1 ? "" : "s"
            }`;
            const manageHref = branchLiveRecordedBatchPath(branchId, batch.id);

            return (
              <tr
                key={batch.id}
                className={cn(
                  "border-b border-slate-100 transition-colors",
                  isExpiredTab
                    ? "bg-slate-100/80 text-slate-500"
                    : "bg-white hover:bg-slate-50",
                )}
              >
                <td className={TABLE_CELL_CLASS}>
                  <p
                    className={cn(
                      "truncate font-medium",
                      isExpiredTab ? "text-slate-500" : "text-[#102A56]",
                    )}
                    title={batch.name}
                  >
                    {batch.name}
                  </p>
                  {batch.code ? (
                    <p className="truncate font-mono text-xs text-slate-500">
                      {batch.code}
                    </p>
                  ) : null}
                </td>
                <td
                  className={cn(
                    TABLE_CELL_CLASS,
                    isExpiredTab ? "text-slate-400" : "text-slate-700",
                  )}
                >
                  <span className="block truncate">
                    {batch.course?.title?.trim() || "No course assigned"}
                  </span>
                </td>
                <td
                  className={cn(
                    TABLE_CELL_CLASS,
                    isExpiredTab ? "text-slate-400" : "text-slate-700",
                  )}
                >
                  <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                    <span className="truncate">{scheduleRange}</span>
                    <span className="truncate text-xs text-[#647A9B]">
                      {timingsLabel}
                    </span>
                  </div>
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <BatchStatusBadge
                    displayStatus={displayStatus}
                    status={batch.status}
                    isActive={batch.isActive}
                    isDeleted={Boolean(batch.isDeleted || batch.deletedAt)}
                  />
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end">
                    <Link href={manageHref} className={LIVE_RECORDED_GRADIENT_BUTTON_CLASS}>
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      Add Live
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </BranchManageTableShell>
      </div>
    </div>
  );
}
