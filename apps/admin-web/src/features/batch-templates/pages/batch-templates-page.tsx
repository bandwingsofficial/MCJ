"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchTemplateBulkActionsToolbar } from "@/src/features/batch-templates/components/batch-template-bulk-actions-toolbar";
import type { BulkBatchTimingAction } from "@/src/features/batch-templates/components/batch-template-bulk-actions-toolbar";
import { BatchTemplateFormModal } from "@/src/features/batch-templates/components/batch-template-form-modal";
import { BatchTemplateSummaryHeader } from "@/src/features/batch-templates/components/batch-template-summary-header";
import { BatchTemplateTable } from "@/src/features/batch-templates/components/batch-template-table";
import { useBatchTemplates } from "@/src/features/batch-templates/hooks/use-batch-templates";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";
import {
  getEligibleActivateIds,
  getEligibleArchiveIds,
  getEligibleDeactivateIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/batch-templates/utils/batch-template-bulk.utils";

type DialogAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "restore"
  | "permanent-delete"
  | null;

export function BatchTemplatesPage() {
  const {
    templates,
    total,
    catalogTotal,
    isInitialLoading,
    isFetching,
    error,
    filters,
    setFilters,
    refetch,
  } = useBatchTemplates();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<BatchTemplate | null>(null);
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);
  const [dialogTarget, setDialogTarget] = useState<BatchTemplate | null>(null);
  const [bulkAction, setBulkAction] = useState<BulkBatchTimingAction | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters.page, filters.pageSize, filters.mode, filters.status, filters.search]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    if (filters.page > totalPages) {
      setFilters({ ...filters, page: totalPages });
    }
  }, [total, filters, setFilters]);

  const page = filters.page;
  const pageSize = filters.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const tableActionLoading = actionLoading;

  const eligibleBulkIds = useMemo(() => {
    if (!bulkAction) return [];
    switch (bulkAction) {
      case "activate":
        return getEligibleActivateIds(templates, selectedIds);
      case "deactivate":
        return getEligibleDeactivateIds(templates, selectedIds);
      case "archive":
        return getEligibleArchiveIds(templates, selectedIds);
      case "restore":
        return getEligibleRestoreIds(templates, selectedIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(templates, selectedIds);
      default:
        return [];
    }
  }, [bulkAction, templates, selectedIds]);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const closeDialog = () => {
    setDialogAction(null);
    setDialogTarget(null);
  };

  const runSingleAction = async (
    action: Exclude<DialogAction, null>,
    target: BatchTemplate,
  ) => {
    setActionLoading(true);
    try {
      switch (action) {
        case "activate":
          await batchTemplateService.activateTemplate(target.id);
          appToast.success("Batch timing activated");
          break;
        case "deactivate":
          await batchTemplateService.deactivateTemplate(target.id);
          appToast.success("Batch timing deactivated");
          break;
        case "archive":
          await batchTemplateService.archiveTemplate(target.id);
          appToast.success("Batch timing archived");
          break;
        case "restore":
          await batchTemplateService.restoreTemplate(target.id);
          appToast.success("Batch timing restored");
          break;
        case "permanent-delete":
          await batchTemplateService.permanentlyDeleteTemplate(target.id);
          appToast.success("Batch timing permanently deleted");
          break;
      }
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmSingleDialog = async () => {
    if (!dialogTarget || !dialogAction) return;
    const target = dialogTarget;
    const action = dialogAction;
    closeDialog();
    await runSingleAction(action, target);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction || eligibleBulkIds.length === 0) {
      setBulkAction(null);
      return;
    }

    const action = bulkAction;
    const ids = eligibleBulkIds;
    setBulkAction(null);
    setActionLoading(true);

    try {
      switch (action) {
        case "activate": {
          const result = await batchTemplateService.bulkActivate(ids);
          appToast.success(
            result.message ||
              `${result.data.succeeded} batch timing(s) activated`,
          );
          break;
        }
        case "deactivate": {
          const result = await batchTemplateService.bulkDeactivate(ids);
          appToast.success(
            result.message ||
              `${result.data.succeeded} batch timing(s) deactivated`,
          );
          break;
        }
        case "archive": {
          const result = await batchTemplateService.bulkArchive(ids);
          appToast.success(
            result.message ||
              `${result.data.succeeded} batch timing(s) archived`,
          );
          break;
        }
        case "restore": {
          const result = await batchTemplateService.bulkRestore(ids);
          appToast.success(
            result.message ||
              `${result.data.succeeded} batch timing(s) restored`,
          );
          break;
        }
        case "permanent-delete": {
          const result = await batchTemplateService.bulkPermanentDelete(ids);
          appToast.success(
            result.message ||
              `${result.data.succeeded} batch timing(s) permanently deleted`,
          );
          break;
        }
      }
      setSelectedIds([]);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;
    const noun = count === 1 ? "batch timing" : "batch timings";

    switch (bulkAction) {
      case "activate":
        return {
          title: "Activate selected batch timings?",
          description: `Activate ${count} selected ${noun}?`,
          confirmLabel: "Activate",
          confirmVariant: "success" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected batch timings?",
          description: `Deactivate ${count} selected ${noun}?`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "archive":
        return {
          title: "Archive selected batch timings?",
          description: `Archive ${count} selected ${noun}? They can be restored later.`,
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected batch timings?",
          description: `Restore ${count} archived ${noun}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected batch timings?",
          description: `You are about to permanently delete ${count} ${noun}. This action cannot be undone.`,
          confirmLabel: "Delete Permanently",
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
  }, [bulkAction, eligibleBulkIds.length]);

  if (error && templates.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Batch Timings"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const targetName = dialogTarget?.name ?? "This batch timing";

  return (
    <div className="min-h-full min-w-0">
      <BatchTemplateSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading}
        createDisabled={tableActionLoading}
        onCreate={openCreate}
        search={filters.search}
        onSearchChange={(value) =>
          setFilters({ ...filters, search: value })
        }
        mode={filters.mode}
        onModeChange={(mode) =>
          setFilters({ ...filters, mode, page: 1 })
        }
        status={filters.status}
        onStatusChange={(status) =>
          setFilters({ ...filters, status, page: 1 })
        }
      />

      <div className="mt-5">
        <Card className="min-w-0 overflow-hidden p-0">
          <div className="px-4 pt-4">
            <BatchTemplateBulkActionsToolbar
              templates={templates}
              selectedIds={selectedIds}
              disabled={tableActionLoading || isFetching}
              onAction={setBulkAction}
            />
          </div>

          {isInitialLoading ? (
            <div className="p-4">
              <SkeletonTable rows={10} />
            </div>
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
                  <span className="sr-only">Updating batch timings</span>
                ) : null}

                <BatchTemplateTable
                  templates={templates}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  actionsDisabled={tableActionLoading || isFetching}
                  selectionDisabled={tableActionLoading || isFetching}
                  onEdit={(template) => {
                    setEditing(template);
                    setIsFormOpen(true);
                  }}
                  onActivate={(template) => {
                    setDialogTarget(template);
                    setDialogAction("activate");
                  }}
                  onDeactivate={(template) => {
                    setDialogTarget(template);
                    setDialogAction("deactivate");
                  }}
                  onArchive={(template) => {
                    setDialogTarget(template);
                    setDialogAction("archive");
                  }}
                  onRestore={(template) => {
                    setDialogTarget(template);
                    setDialogAction("restore");
                  }}
                  onPermanentDelete={(template) => {
                    setDialogTarget(template);
                    setDialogAction("permanent-delete");
                  }}
                  onCreate={openCreate}
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
                        disabled={tableActionLoading}
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
              ) : (
                <div className="border-t border-[#DCE8F5] bg-[#F8FBFF] px-4 py-3 text-sm text-[#647A9B]">
                  No batch timings to paginate
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      <BatchTemplateFormModal
        open={isFormOpen}
        template={editing}
        onClose={() => {
          setIsFormOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          void refetch();
        }}
      />

      <ConfirmDialog
        open={dialogAction === "activate" && Boolean(dialogTarget)}
        title="Activate Batch Timing?"
        description={`${targetName} will become active and available when assigning batches.`}
        confirmLabel="Activate"
        confirmVariant="success"
        loading={actionLoading}
        onCancel={closeDialog}
        onConfirm={() => {
          void confirmSingleDialog();
        }}
      />

      <ConfirmDialog
        open={dialogAction === "deactivate" && Boolean(dialogTarget)}
        title="Deactivate Batch Timing?"
        description={`${targetName} will become inactive. Existing batches are not changed.`}
        confirmLabel="Deactivate"
        confirmVariant="danger"
        loading={actionLoading}
        onCancel={closeDialog}
        onConfirm={() => {
          void confirmSingleDialog();
        }}
      />

      <ConfirmDialog
        open={dialogAction === "archive" && Boolean(dialogTarget)}
        title="Archive Batch Timing?"
        description="This batch timing will be moved to archived status."
        confirmLabel="Archive"
        confirmVariant="danger"
        loading={actionLoading}
        onCancel={closeDialog}
        onConfirm={() => {
          void confirmSingleDialog();
        }}
      />

      <ConfirmDialog
        open={dialogAction === "restore" && Boolean(dialogTarget)}
        title="Restore Batch Timing?"
        description="The batch timing will be restored."
        confirmLabel="Restore"
        confirmVariant="primary"
        loading={actionLoading}
        onCancel={closeDialog}
        onConfirm={() => {
          void confirmSingleDialog();
        }}
      />

      <ConfirmDialog
        open={dialogAction === "permanent-delete" && Boolean(dialogTarget)}
        title="Permanently Delete Batch Timing?"
        description="This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        loading={actionLoading}
        onCancel={closeDialog}
        onConfirm={() => {
          void confirmSingleDialog();
        }}
      />

      <ConfirmDialog
        open={bulkAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        confirmVariant={bulkDialogCopy.confirmVariant}
        loading={actionLoading}
        onCancel={() => {
          if (!actionLoading) setBulkAction(null);
        }}
        onConfirm={() => {
          void confirmBulkAction();
        }}
      />
    </div>
  );
}
