"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Layers, Link2Off, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchBatchFiltersBar } from "@/src/features/branches/components/manage/branch-batch-filters";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import {
  BRANCH_PRIMARY_BUTTON_CLASS,
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  assignBatchToBranch,
  unassignBatchFromBranch,
} from "@/src/features/branches/utils/branch-assign.utils";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch, BatchFilters } from "@/src/features/batches/types/batch.types";
import { formatBatchDateRange } from "@/src/features/batches/utils/batch.helper";
import {
  BLOCKED_BATCH_SELECTION_MESSAGE,
  getBatchDisplayStatus,
  isBatchSelectableForAssignment,
} from "@/src/features/batches/utils/batch-select.utils";
import { getBatchTimingsCount } from "@/src/features/batches/utils/batch-timing.utils";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageBatchesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [filters, setFilters] = useState<BatchFilters>({
    search: "",
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!branchId) {
      setBatches([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const batchResponse = await batchService.getBatches({
        search: filters.search,
        branchId,
        batchStatus: filters.batchStatus,
        page: 1,
        pageSize: 100,
      });

      const items = batchResponse.data.items ?? [];
      setBatches(items);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, filters]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openAssign = async () => {
    if (!branchId) {
      return;
    }

    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const [assignedResponse, availableResponse] = await Promise.all([
        batchService.getBatches({
          branchId,
          includeDeleted: false,
          page: 1,
          pageSize: 100,
        }),
        batchService.getBatches({
          includeDeleted: false,
          isDeleted: false,
          page: 1,
          pageSize: 100,
        }),
      ]);
      const assigned = new Set(
        (assignedResponse.data.items ?? []).map((item) => item.id),
      );
      setAssignCandidates(
        (availableResponse.data.items ?? [])
          .filter(
            (item) =>
              !item.deletedAt &&
              !item.isDeleted &&
              !assigned.has(item.id) &&
              item.branchId !== branchId,
          )
          .map((item) => {
            const display = getBatchDisplayStatus(item);
            const selectable = isBatchSelectableForAssignment(item);
            return {
              id: item.id,
              label: item.name,
              meta: item.code ?? undefined,
              disabled: !selectable,
              statusLabel: selectable
                ? display.label
                : display.key === "COMPLETED" || display.key === "EXPIRED"
                  ? "Completed / Expired"
                  : display.label,
            };
          }),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    void openAssign();
    onAssignOnMountHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when navigated from overview assign
  }, [assignOnMount, assignmentsDisabled, onAssignOnMountHandled]);

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0 || !branchId) {
      return;
    }

    const selectableIds = ids.filter((id) => {
      const candidate = assignCandidates.find((item) => item.id === id);
      return candidate && !candidate.disabled;
    });

    if (selectableIds.length === 0) {
      appToast.error(BLOCKED_BATCH_SELECTION_MESSAGE);
      return;
    }

    if (selectableIds.length !== ids.length) {
      appToast.error(BLOCKED_BATCH_SELECTION_MESSAGE);
    }

    setAssignSubmitting(true);
    try {
      for (const id of selectableIds) {
        await assignBatchToBranch(id, branchId);
      }
      appToast.success(
        selectableIds.length === 1
          ? "Batch assigned successfully"
          : `${selectableIds.length} batches assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    setUnassignLoading(true);
    try {
      await unassignBatchFromBranch(unassignTarget.id);
      appToast.success("Batch unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className={BRANCH_TABLE_CARD_CLASS}>
          <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-2.5">
            <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-3">
              <div className="shrink-0">
                <h2 className="text-base font-semibold text-[#102A56]">Batches</h2>
                <p className="mt-0.5 text-sm text-[#647A9B]">
                  Parent batches assigned to this branch.
                  {!isLoading ? (
                    <span className={`${BRANCH_TAB_COUNT_CLASS} ml-2`}>
                      Total:
                      <span className="ml-1 font-semibold tabular-nums">
                        {batches.length}
                      </span>
                    </span>
                  ) : null}
                </p>
              </div>

              <BranchBatchFiltersBar
                filters={filters}
                onChange={setFilters}
              />

              <Button
                type="button"
                disabled={assignmentsDisabled}
                onClick={() => {
                  void openAssign();
                }}
                className={BRANCH_PRIMARY_BUTTON_CLASS}
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Assign Batch
              </Button>
            </div>
          </div>

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
                className: "w-[6.75rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && batches.length === 0}
            emptyTitle="No Batches Assigned Yet"
            emptyDescription="Assign batches to this branch to get started."
            emptyIcon={Layers}
          >
            {batches.map((batch) => {
              const displayStatus = getBatchDisplayStatus(batch);
              const isLifecycleBlocked =
                displayStatus.key === "COMPLETED" ||
                displayStatus.key === "EXPIRED" ||
                displayStatus.key === "CANCELLED" ||
                displayStatus.key === "ARCHIVED";
              const scheduleRange = formatBatchDateRange(
                batch.startDate,
                batch.endDate,
              ).replace(" – ", " → ");
              const timingsCount = getBatchTimingsCount(batch);
              const timingsLabel = `${timingsCount} Batch Timing${
                timingsCount === 1 ? "" : "s"
              }`;

              return (
                <tr
                  key={batch.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    isLifecycleBlocked
                      ? "bg-slate-100/80 text-slate-500"
                      : "bg-white hover:bg-slate-50",
                  )}
                >
                  <td className={TABLE_CELL_CLASS}>
                    <p
                      className={cn(
                        "truncate font-medium",
                        isLifecycleBlocked ? "text-slate-500" : "text-[#102A56]",
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
                      isLifecycleBlocked ? "text-slate-400" : "text-slate-700",
                    )}
                  >
                    <span className="block truncate">
                      {batch.course?.title?.trim() || "No course assigned"}
                    </span>
                  </td>
                  <td
                    className={cn(
                      TABLE_CELL_CLASS,
                      isLifecycleBlocked ? "text-slate-400" : "text-slate-700",
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
                    <div className="flex items-center justify-end gap-2">
                      <BranchIconAction
                        icon={Eye}
                        label="View batch"
                        primary
                        href={`/batches/${batch.id}/manage`}
                      />
                      <BranchIconAction
                        icon={Link2Off}
                        label="Unassign"
                        destructive
                        disabled={assignmentsDisabled || unassignLoading}
                        onClick={() =>
                          setUnassignTarget({
                            id: batch.id,
                            label: batch.name,
                          })
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </BranchManageTableShell>
        </div>
      </div>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Batches"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search batches..."
        emptyMessage="No batches available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign batch?"
        description={`Remove "${unassignTarget?.label ?? "this batch"}" from this branch? The batch record will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassign}
      />
    </>
  );
}
