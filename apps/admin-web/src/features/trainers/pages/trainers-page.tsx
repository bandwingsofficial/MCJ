"use client";

import { useEffect, useMemo, useState } from "react";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import type {
  TrainerFilters as TrainerFiltersState,
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

import { useTrainers } from "@/src/features/trainers/hooks/use-trainers";
import { useActivateTrainer } from "@/src/features/trainers/hooks/use-activate-trainer";
import { useDeactivateTrainer } from "@/src/features/trainers/hooks/use-deactivate-trainer";
import { useDeleteTrainer } from "@/src/features/trainers/hooks/use-delete-trainer";
import { useRestoreTrainer } from "@/src/features/trainers/hooks/use-restore-trainer";
import { usePermanentDeleteTrainer } from "@/src/features/trainers/hooks/use-permanent-delete-trainer";
import { useBulkActivateTrainers } from "@/src/features/trainers/hooks/use-bulk-activate-trainers";
import { useBulkDeactivateTrainers } from "@/src/features/trainers/hooks/use-bulk-deactivate-trainers";
import { useBulkDeleteTrainers } from "@/src/features/trainers/hooks/use-bulk-delete-trainers";
import { useBulkRestoreTrainers } from "@/src/features/trainers/hooks/use-bulk-restore-trainers";
import { useBulkPermanentDeleteTrainers } from "@/src/features/trainers/hooks/use-bulk-permanent-delete-trainers";

import { trainerService } from "@/src/features/trainers/services/trainer.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { TrainerFilters as TrainerFiltersBar } from "@/src/features/trainers/components/trainer-filters";
import { TrainerTable } from "@/src/features/trainers/components/trainer-table";
import { TrainerSummaryHeader } from "@/src/features/trainers/components/trainer-summary-header";
import { CreateTrainerModal } from "@/src/features/trainers/components/create-trainer-modal";
import { UpdateTrainerModal } from "@/src/features/trainers/components/update-trainer-modal";
import { StatusTrainerDialog } from "@/src/features/trainers/components/status-trainer-dialog";
import { TrainerDeleteDialog } from "@/src/features/trainers/components/trainer-delete-dialog";
import { TrainerRestoreDialog } from "@/src/features/trainers/components/trainer-restore-dialog";
import { PermanentDeleteTrainerDialog } from "@/src/features/trainers/components/permanent-delete-trainer-dialog";
import {
  TrainerBulkActionsToolbar,
  type BulkTrainerAction,
} from "@/src/features/trainers/components/trainer-bulk-actions-toolbar";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/trainers/utils/trainer-bulk.utils";

function getEmptyMessage(filters: TrainerFiltersState): string {
  if (filters.status === "ARCHIVED") {
    return "No archived trainers found.";
  }

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.trainerType ||
      filters.status,
  );

  if (hasActiveFilters) {
    return "No trainers match your filters.";
  }

  return "No trainers found.";
}

export function TrainersPage() {
  const {
    trainers,
    total,
    catalogTotal,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useTrainers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<
    string[]
  >([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkTrainerAction | null>(null);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<
    "ACTIVE" | "INACTIVE" | null
  >(null);
  const [isReordering, setIsReordering] = useState(false);

  const { activateTrainer, isLoading: isActivating } =
    useActivateTrainer();
  const { deactivateTrainer, isLoading: isDeactivating } =
    useDeactivateTrainer();
  const { deleteTrainer, isLoading: isDeleting } =
    useDeleteTrainer();
  const { restoreTrainer, isLoading: isRestoring } =
    useRestoreTrainer();
  const {
    permanentDeleteTrainer,
    isLoading: isPermanentDeleting,
  } = usePermanentDeleteTrainer();
  const {
    bulkActivate,
    isPending: isBulkActivating,
  } = useBulkActivateTrainers();
  const {
    bulkDeactivate,
    isPending: isBulkDeactivating,
  } = useBulkDeactivateTrainers();
  const {
    bulkDelete,
    isPending: isBulkDeleting,
  } = useBulkDeleteTrainers();
  const {
    bulkRestore,
    isPending: isBulkRestoring,
  } = useBulkRestoreTrainers();
  const {
    bulkPermanentDelete,
    isPending: isBulkPermanentDeleting,
  } = useBulkPermanentDeleteTrainers();

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const emptyMessage = useMemo(
    () => getEmptyMessage(filters),
    [filters],
  );

  const bulkActionLoading =
    isBulkActivating ||
    isBulkDeactivating ||
    isBulkDeleting ||
    isBulkRestoring ||
    isBulkPermanentDeleting;

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isDeleting ||
    isRestoring ||
    isPermanentDeleting ||
    isReordering ||
    bulkActionLoading;

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(
          trainers,
          selectedTrainerIds,
        );
      case "deactivate":
        return getEligibleDeactivateIds(
          trainers,
          selectedTrainerIds,
        );
      case "delete":
        return getEligibleDeleteIds(
          trainers,
          selectedTrainerIds,
        );
      case "restore":
        return getEligibleRestoreIds(
          trainers,
          selectedTrainerIds,
        );
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(
          trainers,
          selectedTrainerIds,
        );
      default:
        return [];
    }
  }, [bulkConfirmAction, trainers, selectedTrainerIds]);

  useEffect(() => {
    setSelectedTrainerIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.trainerType,
    filters.search,
  ]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    if (page > maxPage) {
      setFilters({
        ...filters,
        page: maxPage,
      });
    }
  }, [total, page, pageSize, filters, setFilters]);

  const handleReorder = async (payload: {
    trainerId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await trainerService.reorderTrainers(payload);
      appToast.success("Trainer order updated");
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

    let result = null;

    switch (bulkConfirmAction) {
      case "activate":
        result = await bulkActivate(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "trainer(s) activated successfully",
            ),
          );
        }
        break;
      case "deactivate":
        result = await bulkDeactivate(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "trainer(s) deactivated successfully",
            ),
          );
        }
        break;
      case "delete":
        result = await bulkDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "trainer(s) archived successfully",
            ),
          );
        }
        break;
      case "restore":
        result = await bulkRestore(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "trainer(s) restored successfully",
            ),
          );
        }
        break;
      case "permanent-delete":
        result = await bulkPermanentDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "trainer(s) permanently deleted",
            ),
          );
        }
        break;
    }

    if (result) {
      setSelectedTrainerIds([]);
      setBulkConfirmAction(null);
      await refetch();
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected trainers?",
          description: `Activate ${count} selected trainer${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
          confirmVariant: "primary" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected trainers?",
          description: `Deactivate ${count} selected trainer${count === 1 ? "" : "s"}? They will be removed from active ordering.`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive selected trainers?",
          description: `Archive ${count} selected trainer${count === 1 ? "" : "s"}? They can be restored later.`,
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected trainers?",
          description: `Restore ${count} archived trainer${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected trainers?",
          description: `You are about to permanently delete ${count} trainer${count === 1 ? "" : "s"}. This action cannot be undone.`,
          confirmLabel: "Permanently Delete",
          confirmVariant: "danger" as const,
        };
      default:
        return {
          title: "",
          description: "",
          confirmLabel: "Confirm",
          confirmVariant: "primary" as const,
        };
    }
  }, [bulkConfirmAction, eligibleBulkIds.length]);

  if (error && trainers.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Trainers"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="-m-6 min-h-full bg-white p-6">
      <TrainerSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={bulkActionLoading}
        onCreate={() => setIsCreateOpen(true)}
      />

      <div className="mt-6 space-y-3">
        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <TrainerFiltersBar
              filters={filters}
              onChange={setFilters}
            />
          </div>

          <TrainerBulkActionsToolbar
            trainers={trainers}
            selectedTrainerIds={selectedTrainerIds}
            disabled={actionLoading || isFetching}
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

              <div aria-busy={isFetching} className="relative">
                {isFetching ? (
                  <span className="sr-only">
                    Updating trainers
                  </span>
                ) : null}

                <TrainerTable
                  trainers={trainers}
                  selectedTrainerIds={selectedTrainerIds}
                  onSelectionChange={setSelectedTrainerIds}
                  actionsDisabled={actionLoading || isFetching}
                  selectionDisabled={actionLoading || isFetching}
                  reorderDisabled={
                    isReordering ||
                    !!filters.status ||
                    !!(filters.search ?? "").trim() ||
                    !!filters.trainerType ||
                    isFetching ||
                    selectedTrainerIds.length > 0
                  }
                  emptyMessage={emptyMessage}
                  onEdit={(trainer) => {
                    setSelectedTrainer(trainer);
                    setIsEditOpen(true);
                  }}
                  onActivate={(trainer) => {
                    setSelectedTrainer(trainer);
                    setStatusTarget("ACTIVE");
                    setIsStatusOpen(true);
                  }}
                  onDeactivate={(trainer) => {
                    setSelectedTrainer(trainer);
                    setStatusTarget("INACTIVE");
                    setIsStatusOpen(true);
                  }}
                  onDelete={(trainer) => {
                    setSelectedTrainer(trainer);
                    setIsDeleteOpen(true);
                  }}
                  onRestore={(trainer) => {
                    setSelectedTrainer(trainer);
                    setIsRestoreOpen(true);
                  }}
                  onPermanentDelete={(trainer) => {
                    setSelectedTrainer(trainer);
                    setIsPermanentDeleteOpen(true);
                  }}
                  onReorder={handleReorder}
                />
              </div>

              {total > 0 ? (
                <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                    <span className="leading-9">
                      Showing {from}–{to} of {total}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">
                        Rows per page
                      </span>
                      <select
                        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
                        value={pageSize}
                        disabled={bulkActionLoading}
                        onChange={(event) =>
                          setFilters({
                            ...filters,
                            pageSize: Number(
                              event.target.value,
                            ),
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
                      setFilters({
                        ...filters,
                        page: nextPage,
                      })
                    }
                  />
                </div>
              ) : null}
            </>
          )}
        </Card>
      </div>

      <CreateTrainerModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />

      <UpdateTrainerModal
        open={isEditOpen}
        trainer={selectedTrainer}
        onClose={() => {
          setIsEditOpen(false);
        }}
        onSuccess={() => {
          void refetch();
        }}
      />

      <StatusTrainerDialog
        open={isStatusOpen}
        trainer={selectedTrainer}
        isLoading={isActivating || isDeactivating}
        onClose={() => {
          setIsStatusOpen(false);
          setStatusTarget(null);
        }}
        onConfirm={async () => {
          if (!selectedTrainer || !statusTarget) {
            return;
          }

          const success =
            statusTarget === "ACTIVE"
              ? await activateTrainer(selectedTrainer.id)
              : await deactivateTrainer(selectedTrainer.id);

          if (success) {
            setIsStatusOpen(false);
            setStatusTarget(null);
            await refetch();
          }
        }}
      />

      <TrainerDeleteDialog
        open={isDeleteOpen}
        isLoading={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedTrainer) {
            return;
          }

          const success = await deleteTrainer(
            selectedTrainer.id,
          );

          if (success) {
            setIsDeleteOpen(false);
            await refetch();
          }
        }}
      />

      <TrainerRestoreDialog
        open={isRestoreOpen}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          if (!selectedTrainer) {
            return;
          }

          const success = await restoreTrainer(
            selectedTrainer.id,
          );

          if (success) {
            setIsRestoreOpen(false);
            await refetch();
          }
        }}
      />

      <PermanentDeleteTrainerDialog
        open={isPermanentDeleteOpen}
        trainer={selectedTrainer}
        isLoading={isPermanentDeleting}
        onClose={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedTrainer) {
            return;
          }

          const success = await permanentDeleteTrainer(
            selectedTrainer.id,
          );

          if (success) {
            setIsPermanentDeleteOpen(false);
            await refetch();
          }
        }}
      />

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        confirmVariant={bulkDialogCopy.confirmVariant}
        loading={bulkActionLoading}
        onCancel={() => {
          if (!bulkActionLoading) {
            setBulkConfirmAction(null);
          }
        }}
        onConfirm={() => {
          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
