"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBatches } from "@/src/features/batches/hooks/useBatches";
import { useActivateBatch } from "@/src/features/batches/hooks/useActivateBatch";
import { useDeactivateBatch } from "@/src/features/batches/hooks/useDeactivateBatch";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { useRestoreBatch } from "@/src/features/batches/hooks/useRestoreBatch";
import { batchService } from "@/src/features/batches/services/batch.service";

import { BatchSummaryHeader } from "@/src/features/batches/components/batch-summary-header";
import { BatchLifecycleTabs } from "@/src/features/batches/components/batch-lifecycle-tabs";
import { BatchTable } from "@/src/features/batches/components/BatchTable";
import {
  BatchBulkActionsToolbar,
  type BulkBatchAction,
} from "@/src/features/batches/components/batch-bulk-actions-toolbar";
import { CreateBatchModal } from "@/src/features/batches/components/create-batch-modal";
import { UpdateBatchModal } from "@/src/features/batches/components/update-batch-modal";
import { PermanentDeleteBatchDialog } from "@/src/features/batches/components/permanent-delete-batch-dialog";

import type {
  BatchLifecycleStatus,
  BatchListItem,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
  notifyBulkBatchResult,
} from "@/src/features/batches/utils/batch-bulk.utils";
import { getBatchEmptyMessage } from "@/src/features/batches/utils/batch-list.utils";

export function BatchPage() {
  const router = useRouter();

  const {
    batches,
    total,
    catalogTotal,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useBatches();

  const { activateBatch, isLoading: isActivating } = useActivateBatch();
  const { deactivateBatch, isLoading: isDeactivating } = useDeactivateBatch();
  const { deleteBatch, isLoading: isArchiving } = useDeleteBatch();
  const { restoreBatch, isLoading: isRestoring } = useRestoreBatch();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [restoreTarget, setRestoreTarget] = useState<BatchListItem | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<BatchListItem | null>(null);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkBatchAction | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    batch: BatchListItem;
    action: "activate" | "deactivate";
  } | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const pageSize = filters.pageSize ?? 50;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const emptyMessage = useMemo(
    () => getBatchEmptyMessage(filters),
    [filters],
  );

  const isArchivedOnlyView = filters.isDeleted === true;

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.courseId ||
      filters.mode ||
      filters.isDeleted !== undefined,
  );

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isArchiving ||
    isRestoring ||
    isReordering ||
    isBulkLoading ||
    isPermanentDeleting;

  const reorderDisabled =
    hasActiveFilters ||
    isFetching ||
    selectedBatchIds.length > 0;

  useEffect(() => {
    void batchService
      .getCourses()
      .then(setCourses)
      .catch(() => {
        // Filter dropdown is optional.
      });
  }, []);

  useEffect(() => {
    setSelectedBatchIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search,
    filters.courseId,
    filters.mode,
    filters.batchStatus,
    filters.isDeleted,
  ]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setFilters({ ...filters, page: maxPage });
    }
  }, [total, page, pageSize, filters, setFilters]);

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(batches, selectedBatchIds);
      case "deactivate":
        return getEligibleDeactivateIds(batches, selectedBatchIds);
      case "delete":
        return getEligibleDeleteIds(batches, selectedBatchIds);
      case "restore":
        return getEligibleRestoreIds(batches, selectedBatchIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(batches, selectedBatchIds);
      default:
        return [];
    }
  }, [bulkConfirmAction, batches, selectedBatchIds]);

  const handleReorder = async (payload: {
    batchId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await batchService.reorderBatches(payload);
      appToast.success("Batch order updated");
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsReordering(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (!bulkConfirmAction || eligibleBulkIds.length === 0) {
      setBulkConfirmAction(null);
      return;
    }

    try {
      setIsBulkLoading(true);
      let result = null;

      switch (bulkConfirmAction) {
        case "activate":
          result = await batchService.bulkActivate(eligibleBulkIds);
          notifyBulkBatchResult(
            result.data,
            "batch(es) activated successfully",
            appToast,
          );
          break;
        case "deactivate":
          result = await batchService.bulkDeactivate(eligibleBulkIds);
          notifyBulkBatchResult(
            result.data,
            "batch(es) deactivated successfully",
            appToast,
          );
          break;
        case "delete":
          result = await batchService.bulkDelete(eligibleBulkIds);
          notifyBulkBatchResult(
            result.data,
            "batch(es) archived successfully",
            appToast,
          );
          break;
        case "restore":
          result = await batchService.bulkRestore(eligibleBulkIds);
          notifyBulkBatchResult(
            result.data,
            "batch(es) restored successfully",
            appToast,
          );
          break;
        case "permanent-delete":
          result = await batchService.bulkPermanentDelete(eligibleBulkIds);
          notifyBulkBatchResult(
            result.data,
            "batch(es) permanently deleted",
            appToast,
          );
          break;
      }

      // Keep selection on total failure so the user can retry.
      const summary = result?.data;
      if (!summary || summary.failedCount === 0 || summary.successCount > 0) {
        setSelectedBatchIds([]);
      }
      setBulkConfirmAction(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsBulkLoading(false);
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected batches?",
          description: `Activate ${count} selected batch${count === 1 ? "" : "es"}?`,
          confirmLabel: "Activate",
        };
      case "deactivate":
        return {
          title: "Deactivate selected batches?",
          description: `Deactivate ${count} selected batch${count === 1 ? "" : "es"}?`,
          confirmLabel: "Deactivate",
        };
      case "delete":
        return {
          title: "Archive selected batches?",
          description: `Archive ${count} selected batch${count === 1 ? "" : "es"}? They can be restored later.`,
          confirmLabel: "Archive",
        };
      case "restore":
        return {
          title: "Restore selected batches?",
          description: `Restore ${count} archived batch${count === 1 ? "" : "es"}?`,
          confirmLabel: "Restore",
        };
      case "permanent-delete":
        return {
          title: "Are you sure you want to permanently delete these batches?",
          description: `This action cannot be undone. The selected batch${count === 1 ? "" : "es"} and associated data will be permanently removed.`,
          confirmLabel: "Permanently Delete",
        };
      default:
        return { title: "", description: "", confirmLabel: "Confirm" };
    }
  }, [bulkConfirmAction, eligibleBulkIds.length]);

  if (error && batches.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Batches"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-full min-w-0">
      <BatchSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={actionLoading}
        onCreate={() => setIsCreateOpen(true)}
        filters={filters}
        courses={courses}
        onFiltersChange={setFilters}
      />

      <div className="mt-5 space-y-3">
        <BatchLifecycleTabs
          value={filters.batchStatus ?? "UPCOMING"}
          disabled={actionLoading || isFetching}
          onChange={(batchStatus: BatchLifecycleStatus) =>
            setFilters({ ...filters, batchStatus, page: 1 })
          }
        />

        <Card className="min-w-0 overflow-hidden p-0">
          <BatchBulkActionsToolbar
            batches={batches}
            selectedBatchIds={selectedBatchIds}
            disabled={actionLoading || isFetching}
            archivedView={isArchivedOnlyView}
            onAction={setBulkConfirmAction}
          />

          {isInitialLoading ? (
            <SkeletonTable rows={10} />
          ) : (
            <>
              {error ? (
                <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {error}{" "}
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div aria-busy={isFetching} className="relative min-w-0">
                {isFetching ? (
                  <span className="sr-only">Updating batches</span>
                ) : null}

                <BatchTable
                  batches={batches}
                  selectedBatchIds={selectedBatchIds}
                  onSelectionChange={setSelectedBatchIds}
                  actionsDisabled={actionLoading || isFetching}
                  selectionDisabled={actionLoading || isFetching}
                  reorderDisabled={reorderDisabled}
                  emptyMessage={emptyMessage}
                  onActivate={(batch) =>
                    setStatusTarget({ batch, action: "activate" })
                  }
                  onDeactivate={(batch) =>
                    setStatusTarget({ batch, action: "deactivate" })
                  }
                  onEdit={(batch) => {
                    setSelectedBatch(batch);
                    setIsEditOpen(true);
                  }}
                  onManage={(batch) =>
                    router.push(`/batches/${batch.id}/manage`)
                  }
                  onRestore={setRestoreTarget}
                  onPermanentDelete={setPermanentDeleteTarget}
                  onReorder={handleReorder}
                />
              </div>

              {total > 0 ? (
                <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-[#DCE8F5] bg-[#F8FBFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#647A9B]">
                    <span className="leading-9">
                      Showing {from}–{to} of {total}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">Rows per page</span>
                      <select
                        className="h-9 rounded-xl border border-[#DCE8F5] bg-white px-2 text-[15px] text-[#102A56]"
                        value={pageSize}
                        disabled={actionLoading}
                        onChange={(event) =>
                          setFilters({
                            ...filters,
                            pageSize: Number(event.target.value),
                            page: 1,
                          })
                        }
                      >
                        {[10, 20, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) =>
                      setFilters({ ...filters, page: nextPage })
                    }
                  />
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>

      <CreateBatchModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <UpdateBatchModal
        open={isEditOpen}
        batch={selectedBatch}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedBatch(null);
        }}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Restore batch?"
        description={
          restoreTarget
            ? `Restore "${restoreTarget.name}" from archive?`
            : ""
        }
        confirmLabel="Restore"
        loading={isRestoring}
        onCancel={() => setRestoreTarget(null)}
        onConfirm={async () => {
          if (!restoreTarget) {
            return;
          }

          try {
            await restoreBatch(restoreTarget.id);
            appToast.success("Batch restored successfully");
            setRestoreTarget(null);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <PermanentDeleteBatchDialog
        open={Boolean(permanentDeleteTarget)}
        batchName={permanentDeleteTarget?.name ?? ""}
        isLoading={isPermanentDeleting}
        onCancel={() => setPermanentDeleteTarget(null)}
        onConfirm={async () => {
          if (!permanentDeleteTarget) {
            return;
          }

          try {
            setIsPermanentDeleting(true);
            await batchService.permanentlyDeleteBatch(permanentDeleteTarget.id);
            appToast.success("Batch permanently deleted");
            setPermanentDeleteTarget(null);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsPermanentDeleting(false);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.action === "activate"
            ? "Activate batch?"
            : "Deactivate batch?"
        }
        description={
          statusTarget
            ? `${statusTarget.action === "activate" ? "Activate" : "Deactivate"} "${statusTarget.batch.name}"?`
            : ""
        }
        confirmLabel={
          statusTarget?.action === "activate" ? "Activate" : "Deactivate"
        }
        loading={isActivating || isDeactivating}
        onCancel={() => setStatusTarget(null)}
        onConfirm={async () => {
          if (!statusTarget) {
            return;
          }

          try {
            if (statusTarget.action === "activate") {
              await activateBatch(statusTarget.batch.id);
              appToast.success("Batch activated successfully");
            } else {
              await deactivateBatch(statusTarget.batch.id);
              appToast.success("Batch deactivated successfully");
            }

            setStatusTarget(null);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        loading={isBulkLoading}
        onCancel={() => setBulkConfirmAction(null)}
        onConfirm={() => {
          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
