"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
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

import { TrainerTable } from "@/src/features/trainers/components/trainer-table";
import { TrainerSummaryHeader } from "@/src/features/trainers/components/trainer-summary-header";

const CreateTrainerModal = dynamic(
  () =>
    import("@/src/features/trainers/components/create-trainer-modal").then(
      (mod) => ({ default: mod.CreateTrainerModal }),
    ),
  { ssr: false },
);

const UpdateTrainerModal = dynamic(
  () =>
    import("@/src/features/trainers/components/update-trainer-modal").then(
      (mod) => ({ default: mod.UpdateTrainerModal }),
    ),
  { ssr: false },
);

const StatusTrainerDialog = dynamic(
  () =>
    import("@/src/features/trainers/components/status-trainer-dialog").then(
      (mod) => ({ default: mod.StatusTrainerDialog }),
    ),
  { ssr: false },
);

const TrainerDeleteDialog = dynamic(
  () =>
    import("@/src/features/trainers/components/trainer-delete-dialog").then(
      (mod) => ({ default: mod.TrainerDeleteDialog }),
    ),
  { ssr: false },
);

const TrainerRestoreDialog = dynamic(
  () =>
    import("@/src/features/trainers/components/trainer-restore-dialog").then(
      (mod) => ({ default: mod.TrainerRestoreDialog }),
    ),
  { ssr: false },
);

const PermanentDeleteTrainerDialog = dynamic(
  () =>
    import(
      "@/src/features/trainers/components/permanent-delete-trainer-dialog"
    ).then((mod) => ({ default: mod.PermanentDeleteTrainerDialog })),
  { ssr: false },
);
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
import {
  buildBulkTrainerDeactivateBlockedDescription,
  buildBulkTrainerDeactivateConfirmDescription,
  buildBulkTrainerDeleteBlockedDescription,
  buildBulkTrainerDeleteConfirmDescription,
  buildTrainerDeactivateDescription,
  buildTrainerDeleteDescription,
  buildTrainerPermanentDeleteDescription,
  collectBulkBranchBlocks,
  isTrainerDeactivateAllowed,
  isTrainerDeleteAllowed,
  parseTrainerDependencySummary,
  type TrainerDependencySummary,
} from "@/src/features/trainers/utils/trainer-dependency-copy.utils";

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
  const searchParams = useSearchParams();
  const openedTrainerFromQueryRef = useRef<string | null>(null);

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
  const [bulkBlockedDescription, setBulkBlockedDescription] = useState<
    string | null
  >(null);
  const [pendingBulkLifecycleCheck, setPendingBulkLifecycleCheck] = useState<
    "deactivate" | "delete" | null
  >(null);
  const bulkCheckRequestIdRef = useRef(0);
  const lifecycleCheckRequestIdRef = useRef(0);
  const [pendingLifecycleCheck, setPendingLifecycleCheck] = useState<{
    trainerId: string;
    action: "deactivate" | "delete";
  } | null>(null);
  const [selectedTrainer, setSelectedTrainer] =
    useState<TrainerListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<
    "ACTIVE" | "INACTIVE" | null
  >(null);
  const [dependencySummary, setDependencySummary] =
    useState<TrainerDependencySummary | null>(null);
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

  const loadTrainerDependencySummary = async (trainerId: string) => {
    const response = await trainerService.getTrainerDependencies(trainerId);
    return parseTrainerDependencySummary(response.data);
  };

  const closeLifecycleDialogs = () => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setIsStatusOpen(false);
    setIsDeleteOpen(false);
    setStatusTarget(null);
    setSelectedTrainer(null);
    setDependencySummary(null);
  };

  const openActivateDialog = (trainer: TrainerListItem) => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setSelectedTrainer(trainer);
    setDependencySummary(null);
    setStatusTarget("ACTIVE");
    setIsStatusOpen(true);
  };

  const openRestoreDialog = (trainer: TrainerListItem) => {
    setSelectedTrainer(trainer);
    setIsRestoreOpen(true);
  };

  const openPermanentDeleteDialog = (trainer: TrainerListItem) => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setSelectedTrainer(trainer);
    setDependencySummary(null);
    setIsPermanentDeleteOpen(true);
  };

  const startLifecycleDependencyCheck = async (
    trainer: TrainerListItem,
    action: "deactivate" | "delete",
  ) => {
    const requestId = ++lifecycleCheckRequestIdRef.current;
    setPendingLifecycleCheck({ trainerId: trainer.id, action });

    try {
      const summary = await loadTrainerDependencySummary(trainer.id);

      if (requestId !== lifecycleCheckRequestIdRef.current) {
        return;
      }

      setSelectedTrainer(trainer);
      setDependencySummary(summary);

      if (action === "deactivate") {
        setStatusTarget("INACTIVE");
        setIsStatusOpen(true);
      } else {
        setIsDeleteOpen(true);
      }
    } catch (error) {
      if (requestId !== lifecycleCheckRequestIdRef.current) {
        return;
      }

      appToast.error(
        getErrorMessage(error) ||
          "Unable to verify branch assignments. Please try again.",
      );
    } finally {
      if (requestId === lifecycleCheckRequestIdRef.current) {
        setPendingLifecycleCheck(null);
      }
    }
  };

  const closeBulkDialog = () => {
    bulkCheckRequestIdRef.current += 1;
    setPendingBulkLifecycleCheck(null);
    setBulkConfirmAction(null);
    setBulkBlockedDescription(null);
  };

  const handleBulkToolbarAction = (action: BulkTrainerAction) => {
    if (pendingBulkLifecycleCheck) {
      return;
    }

    if (action === "deactivate" || action === "delete") {
      const eligibleIds =
        action === "deactivate"
          ? getEligibleDeactivateIds(trainers, selectedTrainerIds)
          : getEligibleDeleteIds(trainers, selectedTrainerIds);

      if (eligibleIds.length === 0) {
        return;
      }

      const requestId = ++bulkCheckRequestIdRef.current;
      setPendingBulkLifecycleCheck(action);

      void (async () => {
        try {
          const blocks = await collectBulkBranchBlocks(
            trainers,
            eligibleIds,
            loadTrainerDependencySummary,
            action === "deactivate" ? "deactivate" : "delete",
          );

          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          if (blocks.length > 0) {
            setBulkBlockedDescription(
              action === "deactivate"
                ? buildBulkTrainerDeactivateBlockedDescription(blocks)
                : buildBulkTrainerDeleteBlockedDescription(blocks),
            );
          } else {
            setBulkBlockedDescription(null);
          }

          setBulkConfirmAction(action);
        } catch (error) {
          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          appToast.error(
            getErrorMessage(error) ||
              "Unable to verify branch assignments. Please try again.",
          );
        } finally {
          if (requestId === bulkCheckRequestIdRef.current) {
            setPendingBulkLifecycleCheck(null);
          }
        }
      })();

      return;
    }

    setBulkBlockedDescription(null);
    setBulkConfirmAction(action);
  };

  useEffect(() => {
    const trainerId = searchParams.get("trainerId")?.trim();

    if (!trainerId || openedTrainerFromQueryRef.current === trainerId) {
      return;
    }

    openedTrainerFromQueryRef.current = trainerId;

    const fromList = trainers.find((trainer) => trainer.id === trainerId);

    if (fromList) {
      setSelectedTrainer(fromList);
      setIsEditOpen(true);
      return;
    }

    let cancelled = false;

    void trainerService
      .getTrainer(trainerId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        const trainer = response.data;
        setSelectedTrainer({
          id: trainer.id,
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          email: trainer.email,
          phone: trainer.phone,
          qualification: trainer.qualification,
          specialization: trainer.specialization,
          employeeCode: trainer.employeeCode,
          trainerType: trainer.trainerType,
          profileImageUrl: trainer.profileImageUrl,
          branchId: trainer.branchId,
          status: trainer.status,
          displayOrder: trainer.displayOrder,
          isDeleted: trainer.isDeleted,
          deletedAt: trainer.deletedAt,
          createdAt: trainer.createdAt,
          updatedAt: trainer.updatedAt,
        });
        setIsEditOpen(true);
      })
      .catch(() => {
        openedTrainerFromQueryRef.current = null;
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, trainers]);

  const bulkActionLoading =
    isBulkActivating ||
    isBulkDeactivating ||
    isBulkDeleting ||
    isBulkRestoring ||
    isBulkPermanentDeleting;

  const tableActionLoading =
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
      closeBulkDialog();
      return;
    }

    if (bulkBlockedDescription) {
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
      closeBulkDialog();
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
          title: "Deactivate trainers?",
          description: buildBulkTrainerDeactivateConfirmDescription(),
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive trainers?",
          description: buildBulkTrainerDeleteConfirmDescription(),
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
    <div className="space-y-3">
      <TrainerSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={bulkActionLoading}
        onCreate={() => setIsCreateOpen(true)}
        search={filters.search ?? ""}
        onSearchChange={(value) =>
          setFilters({
            ...filters,
            search: value,
          })
        }
        trainerType={filters.trainerType}
        onTrainerTypeChange={(trainerType) =>
          setFilters({
            ...filters,
            trainerType,
          })
        }
        status={filters.status}
        onStatusChange={(status) =>
          setFilters({
            ...filters,
            status,
          })
        }
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
          <TrainerBulkActionsToolbar
            trainers={trainers}
            selectedTrainerIds={selectedTrainerIds}
            disabled={tableActionLoading || isFetching}
            pendingBulkLifecycleCheck={pendingBulkLifecycleCheck}
            onAction={handleBulkToolbarAction}
          />

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
                  <span className="sr-only">
                    Updating trainers
                  </span>
                ) : null}

                <TrainerTable
                  trainers={trainers}
                  selectedTrainerIds={selectedTrainerIds}
                  onSelectionChange={setSelectedTrainerIds}
                  pendingLifecycleCheck={pendingLifecycleCheck}
                  actionsDisabled={tableActionLoading || isFetching}
                  selectionDisabled={tableActionLoading || isFetching}
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
                  onActivate={openActivateDialog}
                  onDeactivate={(trainer) => {
                    void startLifecycleDependencyCheck(trainer, "deactivate");
                  }}
                  onDelete={(trainer) => {
                    void startLifecycleDependencyCheck(trainer, "delete");
                  }}
                  onRestore={openRestoreDialog}
                  onPermanentDelete={openPermanentDeleteDialog}
                  onReorder={handleReorder}
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                  <span>
                    Showing {from}–{to} of {total}
                  </span>

                  <label className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">
                      Rows per page
                    </span>
                    <select
                      className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
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

                <CategoryPagination
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
            </>
          )}
        </Card>

      {isCreateOpen ? (
        <CreateTrainerModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {isEditOpen && selectedTrainer ? (
        <UpdateTrainerModal
          open={isEditOpen}
          trainer={selectedTrainer}
          onClose={() => {
            setIsEditOpen(false);
          }}
          onSuccess={async () => {
            await refetch();
          }}
        />
      ) : null}

      {isStatusOpen &&
      (statusTarget === "ACTIVE" ||
        (statusTarget === "INACTIVE" && dependencySummary)) ? (
      <StatusTrainerDialog
        open
        trainer={selectedTrainer}
        mode={statusTarget === "ACTIVE" ? "activate" : "deactivate"}
        description={
          statusTarget === "ACTIVE"
            ? ""
            : buildTrainerDeactivateDescription(dependencySummary)
        }
        isLoading={isActivating || isDeactivating}
        canProceed={
          statusTarget === "ACTIVE" ||
          isTrainerDeactivateAllowed(dependencySummary)
        }
        onClose={closeLifecycleDialogs}
        onConfirm={async () => {
          if (!selectedTrainer || !statusTarget) {
            return;
          }

          if (
            statusTarget === "INACTIVE" &&
            !isTrainerDeactivateAllowed(dependencySummary)
          ) {
            return;
          }

          const success =
            statusTarget === "ACTIVE"
              ? await activateTrainer(selectedTrainer.id)
              : await deactivateTrainer(selectedTrainer.id);

          if (success) {
            closeLifecycleDialogs();
            await refetch();
            return;
          }

          if (statusTarget === "INACTIVE") {
            try {
              const summary = await loadTrainerDependencySummary(
                selectedTrainer.id,
              );
              setDependencySummary(summary);
            } catch {
              // Toast handled in hook.
            }
          }
        }}
      />
      ) : null}

      {isDeleteOpen && dependencySummary ? (
      <TrainerDeleteDialog
        open
        isLoading={isDeleting}
        canDelete={isTrainerDeleteAllowed(dependencySummary)}
        description={buildTrainerDeleteDescription(dependencySummary)}
        onClose={closeLifecycleDialogs}
        onConfirm={async () => {
          if (!selectedTrainer) {
            return;
          }

          if (!isTrainerDeleteAllowed(dependencySummary)) {
            return;
          }

          const success = await deleteTrainer(selectedTrainer.id);

          if (success) {
            closeLifecycleDialogs();
            await refetch();
            return;
          }

          try {
            const summary = await loadTrainerDependencySummary(
              selectedTrainer.id,
            );
            setDependencySummary(summary);
          } catch {
            // Toast handled in hook.
          }
        }}
      />
      ) : null}

      {isRestoreOpen ? (
      <TrainerRestoreDialog
        open
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
      ) : null}

      {isPermanentDeleteOpen ? (
      <PermanentDeleteTrainerDialog
        open
        trainer={selectedTrainer}
        isLoading={isPermanentDeleting}
        description={buildTrainerPermanentDeleteDescription()}
        onClose={() => {
          setIsPermanentDeleteOpen(false);
          setSelectedTrainer(null);
        }}
        onConfirm={async () => {
          if (!selectedTrainer) {
            return;
          }

          const success = await permanentDeleteTrainer(
            selectedTrainer.id,
          );

          if (success) {
            setIsPermanentDeleteOpen(false);
            setSelectedTrainer(null);
            await refetch();
          }
        }}
      />
      ) : null}

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={
          bulkBlockedDescription
            ? bulkConfirmAction === "delete"
              ? "Cannot delete selected trainers"
              : "Cannot deactivate selected trainers"
            : bulkDialogCopy.title
        }
        description={
          bulkBlockedDescription ?? bulkDialogCopy.description
        }
        confirmLabel={
          bulkBlockedDescription ? "OK" : bulkDialogCopy.confirmLabel
        }
        confirmVariant={
          bulkBlockedDescription
            ? "primary"
            : bulkDialogCopy.confirmVariant
        }
        loading={bulkActionLoading && !bulkBlockedDescription}
        showCancel={!bulkBlockedDescription}
        onCancel={() => {
          if (!bulkActionLoading) {
            closeBulkDialog();
          }
        }}
        onConfirm={() => {
          if (bulkBlockedDescription) {
            closeBulkDialog();
            return;
          }

          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
