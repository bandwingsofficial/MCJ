"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBatches } from "@/src/features/batches/hooks/useBatches";
import { useActivateBatch } from "@/src/features/batches/hooks/useActivateBatch";
import { useDeactivateBatch } from "@/src/features/batches/hooks/useDeactivateBatch";
import { useRestoreBatch } from "@/src/features/batches/hooks/useRestoreBatch";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { batchService } from "@/src/features/batches/services/batch.service";

import { BatchSummaryHeader } from "@/src/features/batches/components/batch-summary-header";
import { BatchLifecycleTabs } from "@/src/features/batches/components/batch-lifecycle-tabs";
import { BatchTable } from "@/src/features/batches/components/BatchTable";
import {
  BatchBulkActionsToolbar,
  type BulkBatchAction,
} from "@/src/features/batches/components/batch-bulk-actions-toolbar";
import { PermanentDeleteBatchDialog } from "@/src/features/batches/components/permanent-delete-batch-dialog";
import { BatchDeleteDialog } from "@/src/features/batches/components/BatchDeleteDialog";
import { CancelBatchDialog } from "@/src/features/batches/components/cancel-batch-dialog";

const AssignBatchesModal = dynamic(
  () =>
    import("@/src/features/batches/components/assign-batches-modal").then(
      (mod) => ({ default: mod.AssignBatchesModal }),
    ),
  { ssr: false },
);

const UpdateBatchModal = dynamic(
  () =>
    import("@/src/features/batches/components/update-batch-modal").then(
      (mod) => ({ default: mod.UpdateBatchModal }),
    ),
  { ssr: false },
);

import type {
  BatchLifecycleStatus,
  BatchListItem,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  getEligibleUpcomingDeleteIds,
  notifyBulkBatchResult,
} from "@/src/features/batches/utils/batch-bulk.utils";
import {
  buildBulkBatchDeleteBlockedDescription,
  buildSingleBatchDeleteBlockedDescription,
} from "@/src/features/batches/utils/batch-delete-block.utils";
import { notifyBatchLifecycleChanged } from "@/src/features/batches/utils/batch-lifecycle-sync";
import {
  buildLifecycleBlockedDialogTitle,
  buildSingleLifecycleBlockedDescription,
  getBatchLifecycleStatusLabel,
  isBatchLifecycleBlockingDeactivateOrArchive,
} from "@/src/features/batches/utils/batch-lifecycle-block.utils";

export function BatchPage() {
  const {
    batches,
    total,
    catalogTotal,
    lifecycleCounts,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useBatches();

  const { activateBatch, isLoading: isActivating } = useActivateBatch();
  const { deactivateBatch, isLoading: isDeactivating } = useDeactivateBatch();
  const { restoreBatch, isLoading: isRestoring } = useRestoreBatch();
  const { deleteBatch, isLoading: isArchiving } = useDeleteBatch();
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  const [isUpcomingDeleting, setIsUpcomingDeleting] = useState(false);
  const [upcomingDeleteTarget, setUpcomingDeleteTarget] =
    useState<BatchListItem | null>(null);
  const [upcomingDeleteBlockedDescription, setUpcomingDeleteBlockedDescription] =
    useState<string | null>(null);
  const [bulkDeleteBlockedDescription, setBulkDeleteBlockedDescription] =
    useState<string | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BatchListItem | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkBatchAction | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    batch: BatchListItem;
    action: "activate" | "deactivate";
  } | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<BatchListItem | null>(
    null,
  );
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<BatchListItem | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<BatchListItem | null>(
    null,
  );
  const [archiveBlockedDescription, setArchiveBlockedDescription] = useState<
    string | null
  >(null);
  const [lifecycleBlockedDialog, setLifecycleBlockedDialog] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BatchListItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const pageSize = filters.pageSize ?? 50;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const isArchivedOnlyView = filters.isDeleted === true;

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isRestoring ||
    isArchiving ||
    isPermanentDeleting ||
    isUpcomingDeleting ||
    isCancelling ||
    isBulkLoading;

  const openDeactivateDialog = (batch: BatchListItem) => {
    if (isBatchLifecycleBlockingDeactivateOrArchive(batch)) {
      setLifecycleBlockedDialog({
        title: buildLifecycleBlockedDialogTitle("deactivate", false),
        description: buildSingleLifecycleBlockedDescription(
          batch.name,
          getBatchLifecycleStatusLabel(batch.status),
          "deactivate",
        ),
      });
      return;
    }

    setStatusTarget({ batch, action: "deactivate" });
  };

  const openArchiveDialog = (batch: BatchListItem) => {
    if (isBatchLifecycleBlockingDeactivateOrArchive(batch)) {
      setArchiveBlockedDescription(
        buildSingleLifecycleBlockedDescription(
          batch.name,
          getBatchLifecycleStatusLabel(batch.status),
          "archive",
        ),
      );
      setArchiveTarget(batch);
      return;
    }

    setArchiveBlockedDescription(null);
    setArchiveTarget(batch);
  };

  const openUpcomingDeleteDialog = async (batch: BatchListItem) => {
    try {
      setIsUpcomingDeleting(true);
      const response = await batchService.getBatchDeleteDependencies(batch.id);
      const dependencies = response.data;

      if (!dependencies.canDelete) {
        setUpcomingDeleteBlockedDescription(
          buildSingleBatchDeleteBlockedDescription(
            batch.name,
            dependencies.branchAssignments,
          ),
        );
        setUpcomingDeleteTarget(batch);
        return;
      }

      setUpcomingDeleteBlockedDescription(null);
      setUpcomingDeleteTarget(batch);
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsUpcomingDeleting(false);
    }
  };

  const handleBulkToolbarAction = (action: BulkBatchAction) => {
    if (action === "delete-upcoming") {
      void (async () => {
        const eligibleIds = getEligibleUpcomingDeleteIds(
          batches,
          selectedBatchIds,
        );

        if (eligibleIds.length === 0) {
          return;
        }

        try {
          setIsBulkLoading(true);
          const assignmentsByBatchId: Record<
            string,
            { branchId: string; branchName: string }[]
          > = {};

          for (const batchId of eligibleIds) {
            const response =
              await batchService.getBatchDeleteDependencies(batchId);
            assignmentsByBatchId[batchId] =
              response.data.branchAssignments ?? [];
          }

          const blockedBatches = batches.filter(
            (batch) =>
              eligibleIds.includes(batch.id) &&
              (assignmentsByBatchId[batch.id]?.length ?? 0) > 0,
          );

          if (blockedBatches.length > 0) {
            setBulkDeleteBlockedDescription(
              buildBulkBatchDeleteBlockedDescription(
                blockedBatches,
                assignmentsByBatchId,
              ),
            );
            setBulkConfirmAction("delete-upcoming");
            return;
          }

          setBulkDeleteBlockedDescription(null);
          setBulkConfirmAction("delete-upcoming");
        } catch (err) {
          appToast.error(getErrorMessage(err));
        } finally {
          setIsBulkLoading(false);
        }
      })();

      return;
    }

  };

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
    setBulkConfirmAction(null);
    setBulkDeleteBlockedDescription(null);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search,
    filters.courseId,
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
    if (bulkConfirmAction !== "delete-upcoming") {
      return [];
    }

    return getEligibleUpcomingDeleteIds(batches, selectedBatchIds);
  }, [bulkConfirmAction, batches, selectedBatchIds]);

  const handleBulkConfirm = async () => {
    if (!bulkConfirmAction || eligibleBulkIds.length === 0) {
      setBulkConfirmAction(null);
      return;
    }

    try {
      setIsBulkLoading(true);
      let result = null;

      if (bulkConfirmAction === "delete-upcoming") {
        result = await batchService.bulkDeleteUpcoming(eligibleBulkIds);
        notifyBulkBatchResult(
          result.data,
          "batch(es) deleted successfully",
          appToast,
        );
      }

      // Keep selection on total failure so the user can retry.
      const summary = result?.data;
      if (!summary || summary.failedCount === 0 || summary.successCount > 0) {
        setSelectedBatchIds([]);
      }
      setBulkConfirmAction(null);
      await refetch();
      notifyBatchLifecycleChanged();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsBulkLoading(false);
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    if (bulkConfirmAction !== "delete-upcoming") {
      return { title: "", description: "", confirmLabel: "Confirm" };
    }

    return {
      title: "Delete selected batches?",
      description: `Permanently delete ${count} upcoming batch${count === 1 ? "" : "es"}? This cannot be undone.`,
      confirmLabel: "Delete",
    };
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
    <div className="space-y-3">
      <BatchSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={actionLoading}
        createLabel="Create / Assign Batch"
        onCreate={() => setIsAssignOpen(true)}
        filters={filters}
        courses={courses}
        onFiltersChange={setFilters}
      />

      <BatchLifecycleTabs
        value={filters.batchStatus ?? "UPCOMING"}
        counts={lifecycleCounts}
        disabled={actionLoading || isFetching}
        onChange={(batchStatus: BatchLifecycleStatus) =>
          setFilters({ ...filters, batchStatus, page: 1 })
        }
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
        {!isArchivedOnlyView ? (
          <BatchBulkActionsToolbar
            batches={batches}
            selectedBatchIds={selectedBatchIds}
            lifecycleTab={filters.batchStatus ?? "UPCOMING"}
            disabled={actionLoading || isFetching}
            onAction={handleBulkToolbarAction}
          />
        ) : null}

        {isInitialLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <>
            {error ? (
              <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
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

            <div aria-busy={isFetching} className="relative">
              {isFetching ? (
                <span className="sr-only">Updating batches</span>
              ) : null}

              <BatchTable
                batches={batches}
                selectedBatchIds={selectedBatchIds}
                onSelectionChange={setSelectedBatchIds}
                actionsDisabled={actionLoading || isFetching}
                selectionDisabled={actionLoading || isFetching}
                onActivate={(batch) =>
                  setStatusTarget({ batch, action: "activate" })
                }
                onDeactivate={openDeactivateDialog}
                onArchive={openArchiveDialog}
                onEdit={(batch) => {
                  setSelectedBatch(batch);
                  setIsEditOpen(true);
                }}
                onRestore={setRestoreTarget}
                onPermanentDelete={setPermanentDeleteTarget}
                onDeleteUpcoming={(batch) => {
                  void openUpcomingDeleteDialog(batch);
                }}
                onCancel={setCancelTarget}
              />
            </div>

            <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                <span>
                  Showing {from}–{to} of {total}
                </span>

                <label className="flex items-center gap-1.5">
                  <span className="whitespace-nowrap">Rows per page</span>
                  <select
                    className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
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

              <CategoryPagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) =>
                  setFilters({ ...filters, page: nextPage })
                }
              />
            </div>
          </>
        )}
      </Card>

      {isAssignOpen ? (
        <AssignBatchesModal
          open={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          onSuccess={async () => {
            await refetch();
            notifyBatchLifecycleChanged();
          }}
        />
      ) : null}

      <CancelBatchDialog
        open={Boolean(cancelTarget)}
        batchName={cancelTarget?.name}
        loading={isCancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={async (reason) => {
          if (!cancelTarget) {
            return;
          }

          try {
            setIsCancelling(true);
            await batchService.cancelBatch(cancelTarget.id, reason);
            appToast.success("Batch cancelled successfully");
            setCancelTarget(null);
            await refetch();
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsCancelling(false);
          }
        }}
      />

      {isEditOpen && selectedBatch ? (
        <UpdateBatchModal
          open={isEditOpen}
          batch={selectedBatch}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedBatch(null);
          }}
          onSuccess={async () => {
            await refetch();
            notifyBatchLifecycleChanged();
          }}
        />
      ) : null}

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
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(lifecycleBlockedDialog)}
        title={lifecycleBlockedDialog?.title ?? ""}
        description={lifecycleBlockedDialog?.description ?? ""}
        confirmLabel="OK"
        showCancel={false}
        onCancel={() => setLifecycleBlockedDialog(null)}
        onConfirm={() => setLifecycleBlockedDialog(null)}
      />

      <BatchDeleteDialog
        open={Boolean(archiveTarget)}
        isLoading={isArchiving}
        blocked={Boolean(archiveBlockedDescription)}
        description={
          archiveBlockedDescription ??
          (archiveTarget
            ? `Archive "${archiveTarget.name}"? It can be restored later.`
            : undefined)
        }
        onCancel={() => {
          setArchiveTarget(null);
          setArchiveBlockedDescription(null);
        }}
        onConfirm={async () => {
          if (!archiveTarget || archiveBlockedDescription) {
            return;
          }

          try {
            await deleteBatch(archiveTarget.id);
            appToast.success("Batch archived successfully");
            setArchiveTarget(null);
            await refetch();
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(restoreTarget)}
        title="Restore batch?"
        description={
          restoreTarget
            ? `Restore "${restoreTarget.name}"? Its course and batch timings stay linked.`
            : ""
        }
        confirmLabel="Restore"
        loadingLabel="Restoring..."
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
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(upcomingDeleteTarget)}
        title={
          upcomingDeleteBlockedDescription
            ? "Batch cannot be deleted"
            : "Delete batch?"
        }
        description={
          upcomingDeleteBlockedDescription ??
          (upcomingDeleteTarget
            ? `Permanently delete "${upcomingDeleteTarget.name}"? This cannot be undone.`
            : "")
        }
        confirmLabel={upcomingDeleteBlockedDescription ? "OK" : "Delete"}
        showCancel={!upcomingDeleteBlockedDescription}
        confirmVariant={
          upcomingDeleteBlockedDescription ? "primary" : "danger"
        }
        loading={isUpcomingDeleting && !upcomingDeleteBlockedDescription}
        onCancel={() => {
          setUpcomingDeleteTarget(null);
          setUpcomingDeleteBlockedDescription(null);
        }}
        onConfirm={async () => {
          if (upcomingDeleteBlockedDescription) {
            setUpcomingDeleteTarget(null);
            setUpcomingDeleteBlockedDescription(null);
            return;
          }

          if (!upcomingDeleteTarget) {
            return;
          }

          try {
            setIsUpcomingDeleting(true);
            await batchService.deleteUpcomingBatch(upcomingDeleteTarget.id);
            appToast.success("Batch deleted successfully");
            setSelectedBatchIds((ids) =>
              ids.filter((id) => id !== upcomingDeleteTarget.id),
            );
            setUpcomingDeleteTarget(null);
            await refetch();
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsUpcomingDeleting(false);
          }
        }}
      />

      {permanentDeleteTarget ? (
      <PermanentDeleteBatchDialog
        open
        batchName={permanentDeleteTarget?.name}
        isLoading={isPermanentDeleting}
        onCancel={() => setPermanentDeleteTarget(null)}
        onConfirm={async () => {
          if (!permanentDeleteTarget) {
            return;
          }

          try {
            setIsPermanentDeleting(true);
            await batchService.permanentlyDeleteBatch(
              permanentDeleteTarget.id,
            );
            appToast.success("Batch permanently deleted");
            setPermanentDeleteTarget(null);
            await refetch();
            notifyBatchLifecycleChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsPermanentDeleting(false);
          }
        }}
      />
      ) : null}

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={
          bulkDeleteBlockedDescription
            ? "Selected batches cannot be deleted"
            : bulkDialogCopy.title
        }
        description={
          bulkDeleteBlockedDescription ?? bulkDialogCopy.description
        }
        confirmLabel={
          bulkDeleteBlockedDescription ? "OK" : bulkDialogCopy.confirmLabel
        }
        showCancel={!bulkDeleteBlockedDescription}
        loading={isBulkLoading && !bulkDeleteBlockedDescription}
        onCancel={() => {
          setBulkConfirmAction(null);
          setBulkDeleteBlockedDescription(null);
        }}
        onConfirm={() => {
          if (bulkDeleteBlockedDescription) {
            setBulkConfirmAction(null);
            setBulkDeleteBlockedDescription(null);
            return;
          }

          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
