"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
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
import { batchService } from "@/src/features/batches/services/batch.service";

import { BatchFilters } from "@/src/features/batches/components/batch-filters";
import { BatchTable } from "@/src/features/batches/components/BatchTable";
import {
  BatchBulkActionsToolbar,
  type BulkBatchAction,
} from "@/src/features/batches/components/batch-bulk-actions-toolbar";
import { CreateBatchModal } from "@/src/features/batches/components/create-batch-modal";

import type {
  BatchListItem,
  BranchOption,
  CourseOption,
  TrainerOption,
} from "@/src/features/batches/types/batch.types";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/batches/utils/batch-bulk.utils";

export function BatchPage() {
  const router = useRouter();

  const {
    batches,
    total,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useBatches();

  const { activateBatch, isLoading: isActivating } = useActivateBatch();
  const { deactivateBatch, isLoading: isDeactivating } = useDeactivateBatch();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkBatchAction | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    batch: BatchListItem;
    action: "activate" | "deactivate";
  } | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.courseId ||
      filters.branchId ||
      filters.trainerId ||
      filters.mode ||
      filters.status ||
      filters.includeDeleted,
  );

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isReordering ||
    isBulkLoading;

  const reorderDisabled =
    hasActiveFilters || Boolean((filters.search ?? "").trim());

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [courseItems, branchItems, trainerItems] = await Promise.all([
          batchService.getCourses(),
          batchService.getBranches(),
          batchService.getActiveTrainers(),
        ]);

        setCourses(courseItems);
        setBranches(branchItems);
        setTrainers(
          trainerItems.map((trainer) => ({
            id: trainer.id,
            firstName: trainer.firstName,
            lastName: trainer.lastName,
            employeeCode: trainer.employeeCode,
          })),
        );
      } catch {
        // Filter dropdowns are optional; list still works without them.
      }
    };

    void loadFilterOptions();
  }, []);

  useEffect(() => {
    setSelectedBatchIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.includeDeleted,
    filters.search,
    filters.courseId,
    filters.branchId,
    filters.trainerId,
    filters.mode,
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
          appToast.success(
            formatBulkResultToast(result.data, "batch(es) activated successfully"),
          );
          break;
        case "deactivate":
          result = await batchService.bulkDeactivate(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "batch(es) deactivated successfully",
            ),
          );
          break;
        case "delete":
          result = await batchService.bulkDelete(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(result.data, "batch(es) archived successfully"),
          );
          break;
        case "restore":
          result = await batchService.bulkRestore(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(result.data, "batch(es) restored successfully"),
          );
          break;
        case "permanent-delete":
          result = await batchService.bulkPermanentDelete(eligibleBulkIds);
          appToast.success(
            formatBulkResultToast(
              result.data,
              "batch(es) permanently deleted",
            ),
          );
          break;
      }

      setSelectedBatchIds([]);
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
          title: "Permanently delete selected batches?",
          description: `You are about to permanently delete ${count} batch${count === 1 ? "" : "es"}. This action cannot be undone.`,
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
    <>
      {error && batches.length > 0 ? (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Batches</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage course batches and schedules
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          + Create Batch
        </Button>
      </div>

      <BatchFilters
        filters={filters}
        courses={courses}
        branches={branches}
        trainers={trainers}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            search: "",
            courseId: undefined,
            branchId: undefined,
            trainerId: undefined,
            mode: undefined,
            status: undefined,
            includeDeleted: false,
            page: 1,
            pageSize,
          })
        }
      />

      <BatchBulkActionsToolbar
        batches={batches}
        selectedBatchIds={selectedBatchIds}
        disabled={actionLoading}
        onAction={setBulkConfirmAction}
      />

      <Card className="mt-4 overflow-hidden">
        {isInitialLoading ? (
          <div className="p-4">
            <SkeletonTable />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <BatchTable
              batches={batches}
              selectedBatchIds={selectedBatchIds}
              onSelectionChange={setSelectedBatchIds}
              actionsDisabled={actionLoading}
              reorderDisabled={reorderDisabled}
              emptyTitle={
                hasActiveFilters
                  ? "No batches match your current filters"
                  : "No Batches Found"
              }
              emptyDescription={
                hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first batch to get started."
              }
              onManage={(batch) => router.push(`/batches/${batch.id}/manage`)}
              onActivate={(batch) =>
                setStatusTarget({ batch, action: "activate" })
              }
              onDeactivate={(batch) =>
                setStatusTarget({ batch, action: "deactivate" })
              }
              onReorder={handleReorder}
            />
          </div>
        )}

        {isFetching && !isInitialLoading ? (
          <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
            Updating batches...
          </p>
        ) : null}
      </Card>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        {total > 0 ? (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-2">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm"
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
                  {[10, 20, 50].map((size) => (
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
          </>
        ) : (
          <p className="text-sm text-slate-600">Showing 0 batches</p>
        )}
      </div>

      <CreateBatchModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await refetch();
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
    </>
  );
}
