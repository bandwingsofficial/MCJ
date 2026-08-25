"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { BranchListItem } from "@/src/features/branches/types/branch.types";

import { useBranches } from "@/src/features/branches/hooks/use-branches";
import { useBranch } from "@/src/features/branches/hooks/use-branch";
import { useUpdateStatus } from "@/src/features/branches/hooks/use-update-status";
import { useDeleteBranch } from "@/src/features/branches/hooks/use-delete-branch";
import { useRestoreBranch } from "@/src/features/branches/hooks/use-restore-branch";
import { usePermanentDeleteBranch } from "@/src/features/branches/hooks/use-permanent-delete-branch";
import { useBulkUpdateStatus } from "@/src/features/branches/hooks/use-bulk-update-status";
import { useBulkDeleteBranches } from "@/src/features/branches/hooks/use-bulk-delete-branches";
import { useBulkRestoreBranches } from "@/src/features/branches/hooks/use-bulk-restore-branches";
import { useBulkPermanentDeleteBranches } from "@/src/features/branches/hooks/use-bulk-permanent-delete-branches";

import { branchService } from "@/src/features/branches/services/branch.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { getBranchEmptyMessage } from "@/src/features/branches/utils/branch-list.utils";

import { BranchFilters } from "@/src/features/branches/components/branch-filters";
import { BranchTable } from "@/src/features/branches/components/branch-table";
import { BranchSummaryHeader } from "@/src/features/branches/components/branch-summary-header";
import { CreateBranchModal } from "@/src/features/branches/components/create-branch-modal";
import { UpdateBranchModal } from "@/src/features/branches/components/update-branch-modal";
import { StatusBranchDialog } from "@/src/features/branches/components/status-branch-dialog";
import { DeleteBranchDialog } from "@/src/features/branches/components/delete-branch-dialog";
import { RestoreBranchDialog } from "@/src/features/branches/components/restore-branch-dialog";
import { PermanentDeleteBranchDialog } from "@/src/features/branches/components/permanent-delete-branch-dialog";
import {
  BranchBulkActionsToolbar,
  type BulkBranchAction,
} from "@/src/features/branches/components/branch-bulk-actions-toolbar";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/branches/utils/branch-bulk.utils";

export default function BranchesPage() {
  const router = useRouter();
  const {
    branches,
    total,
    catalogTotal,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useBranches();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [selectedBranchIds, setSelectedBranchIds] = useState<
    string[]
  >([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkBranchAction | null>(null);

  const [selectedBranch, setSelectedBranch] =
    useState<BranchListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<
    "ACTIVE" | "INACTIVE" | null
  >(null);
  const [isReordering, setIsReordering] = useState(false);

  const { updateStatus, isPending: isUpdatingStatus } =
    useUpdateStatus();
  const { deleteBranch, isPending: isDeleting } = useDeleteBranch();
  const { restoreBranch, isPending: isRestoring } = useRestoreBranch();
  const {
    permanentDeleteBranch,
    isPending: isPermanentDeleting,
  } = usePermanentDeleteBranch();
  const {
    bulkUpdateStatus,
    isPending: isBulkUpdatingStatus,
  } = useBulkUpdateStatus();
  const {
    bulkDeleteBranches,
    isPending: isBulkDeleting,
  } = useBulkDeleteBranches();
  const {
    bulkRestoreBranches,
    isPending: isBulkRestoring,
  } = useBulkRestoreBranches();
  const {
    bulkPermanentDeleteBranches,
    isPending: isBulkPermanentDeleting,
  } = useBulkPermanentDeleteBranches();

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const bulkActionLoading =
    isBulkUpdatingStatus ||
    isBulkDeleting ||
    isBulkRestoring ||
    isBulkPermanentDeleting;

  const actionLoading =
    isUpdatingStatus ||
    isDeleting ||
    isRestoring ||
    isPermanentDeleting ||
    isReordering ||
    bulkActionLoading;

  const emptyMessage = useMemo(
    () => getBranchEmptyMessage(filters),
    [filters],
  );

  const {
    branch: editBranch,
    isLoading: isEditBranchLoading,
  } = useBranch(isEditOpen ? selectedBranch?.id : undefined);

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(
          branches,
          selectedBranchIds
        );
      case "deactivate":
        return getEligibleDeactivateIds(
          branches,
          selectedBranchIds
        );
      case "delete":
        return getEligibleDeleteIds(
          branches,
          selectedBranchIds
        );
      case "restore":
        return getEligibleRestoreIds(
          branches,
          selectedBranchIds
        );
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(
          branches,
          selectedBranchIds
        );
      default:
        return [];
    }
  }, [
    bulkConfirmAction,
    branches,
    selectedBranchIds,
  ]);

  useEffect(() => {
    setSelectedBranchIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search,
  ]);

  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(total / pageSize)
    );

    if (page > maxPage) {
      setFilters({
        ...filters,
        page: maxPage,
      });
    }
  }, [total, page, pageSize, filters, setFilters]);

  const handleReorder = async (payload: {
    branchId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await branchService.reorderBranches(payload);
      appToast.success("Branch order updated");
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
        result = await bulkUpdateStatus(
          eligibleBulkIds,
          "ACTIVE"
        );
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "branch(es) activated successfully"
            )
          );
        }
        break;

      case "deactivate":
        result = await bulkUpdateStatus(
          eligibleBulkIds,
          "INACTIVE"
        );
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "branch(es) deactivated successfully"
            )
          );
        }
        break;

      case "delete":
        result = await bulkDeleteBranches(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "branch(es) archived successfully"
            )
          );
        }
        break;

      case "restore":
        result = await bulkRestoreBranches(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "branch(es) restored successfully"
            )
          );
        }
        break;

      case "permanent-delete":
        result = await bulkPermanentDeleteBranches(
          eligibleBulkIds
        );
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "branch(es) permanently deleted"
            )
          );
        }
        break;
    }

    if (result) {
      setSelectedBranchIds([]);
      setBulkConfirmAction(null);
      await refetch();
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected branches?",
          description: `Activate ${count} selected branch${count === 1 ? "" : "es"}?`,
          confirmLabel: "Activate",
          confirmVariant: "primary" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected branches?",
          description: `Deactivate ${count} selected branch${count === 1 ? "" : "es"}? They will be removed from active ordering.`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive selected branches?",
          description: `Archive ${count} selected branch${count === 1 ? "" : "es"}? They can be restored later.`,
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected branches?",
          description: `Restore ${count} archived branch${count === 1 ? "" : "es"}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected branches?",
          description: `You are about to permanently delete ${count} branch${count === 1 ? "" : "es"}. This action cannot be undone.`,
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

  if (error && branches.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Branches"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="-m-6 min-h-full bg-white p-6">
      <BranchSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={bulkActionLoading}
        onCreate={() => setIsCreateOpen(true)}
      />

      <div className="mt-6 space-y-3">
        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <BranchFilters
              filters={filters}
              onChange={setFilters}
            />
          </div>

          <BranchBulkActionsToolbar
            branches={branches}
            selectedBranchIds={selectedBranchIds}
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
                  <span className="sr-only">Updating branches</span>
                ) : null}

                <BranchTable
                  branches={branches}
                  selectedBranchIds={selectedBranchIds}
                  onSelectionChange={setSelectedBranchIds}
                  actionsDisabled={actionLoading || isFetching}
                  selectionDisabled={actionLoading || isFetching}
                  reorderDisabled={
                    isReordering ||
                    !!filters.status ||
                    !!(filters.search ?? "").trim() ||
                    isFetching ||
                    selectedBranchIds.length > 0
                  }
                  emptyMessage={emptyMessage}
                  onEdit={(item) => {
                    setSelectedBranch(item);
                    setIsEditOpen(true);
                  }}
                  onManage={(item) => {
                    router.push(`/branches/${item.id}/manage`);
                  }}
                  onActivate={(item) => {
                    setSelectedBranch(item);
                    setStatusTarget("ACTIVE");
                    setIsStatusOpen(true);
                  }}
                  onDeactivate={(item) => {
                    setSelectedBranch(item);
                    setStatusTarget("INACTIVE");
                    setIsStatusOpen(true);
                  }}
                  onDelete={(item) => {
                    setSelectedBranch(item);
                    setIsDeleteOpen(true);
                  }}
                  onRestore={(item) => {
                    setSelectedBranch(item);
                    setIsRestoreOpen(true);
                  }}
                  onPermanentDelete={(item) => {
                    setSelectedBranch(item);
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
                            pageSize: Number(event.target.value),
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

      <CreateBranchModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          void refetch();
        }}
      />

      <UpdateBranchModal
        open={isEditOpen}
        branch={editBranch}
        isLoading={isEditBranchLoading}
        onClose={() => {
          setIsEditOpen(false);
        }}
        onSuccess={() => {
          void refetch();
        }}
      />

      <StatusBranchDialog
        open={isStatusOpen}
        branch={selectedBranch}
        isLoading={isUpdatingStatus}
        onClose={() => {
          setIsStatusOpen(false);
          setStatusTarget(null);
        }}
        onConfirm={async () => {
          if (!selectedBranch || !statusTarget) {
            return;
          }

          await updateStatus(
            selectedBranch.id,
            statusTarget
          );
          setIsStatusOpen(false);
          setStatusTarget(null);
          await refetch();
        }}
      />

      <DeleteBranchDialog
        open={isDeleteOpen}
        branch={selectedBranch}
        isLoading={isDeleting}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          await deleteBranch(selectedBranch.id);
          setIsDeleteOpen(false);
          await refetch();
        }}
      />

      <RestoreBranchDialog
        open={isRestoreOpen}
        branch={selectedBranch}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          await restoreBranch(selectedBranch.id);
          setIsRestoreOpen(false);
          await refetch();
        }}
      />

      <PermanentDeleteBranchDialog
        open={isPermanentDeleteOpen}
        branch={selectedBranch}
        isLoading={isPermanentDeleting}
        onClose={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          const ok = await permanentDeleteBranch(selectedBranch.id);
          if (!ok) {
            return;
          }

          setIsPermanentDeleteOpen(false);
          await refetch();
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
