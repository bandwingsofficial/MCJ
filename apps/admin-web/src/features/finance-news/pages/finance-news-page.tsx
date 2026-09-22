"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useFinanceNews } from "@/src/features/finance-news/hooks/use-finance-news";
import {
  useActivateFinanceNews,
  useDeactivateFinanceNews,
  useDeleteFinanceNews,
  useRestoreFinanceNews,
  usePermanentDeleteFinanceNews,
} from "@/src/features/finance-news/hooks/use-finance-news-actions";
import { useBulkActivateFinanceNews } from "@/src/features/finance-news/hooks/use-bulk-activate-finance-news";
import { useBulkDeactivateFinanceNews } from "@/src/features/finance-news/hooks/use-bulk-deactivate-finance-news";
import { useBulkDeleteFinanceNews } from "@/src/features/finance-news/hooks/use-bulk-delete-finance-news";
import { useBulkRestoreFinanceNews } from "@/src/features/finance-news/hooks/use-bulk-restore-finance-news";
import { useBulkPermanentDeleteFinanceNews } from "@/src/features/finance-news/hooks/use-bulk-permanent-delete-finance-news";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

import { FinanceNewsTable } from "@/src/features/finance-news/components/finance-news-table";
import { FinanceNewsSummaryHeader } from "@/src/features/finance-news/components/finance-news-summary-header";
const CreateFinanceNewsModal = dynamic(
  () =>
    import("@/src/features/finance-news/components/create-finance-news-modal").then(
      (mod) => ({ default: mod.CreateFinanceNewsModal }),
    ),
  { ssr: false },
);

const StatusFinanceNewsDialog = dynamic(
  () =>
    import("@/src/features/finance-news/components/status-finance-news-dialog").then(
      (mod) => ({ default: mod.StatusFinanceNewsDialog }),
    ),
  { ssr: false },
);

const ArchiveFinanceNewsDialog = dynamic(
  () =>
    import("@/src/features/finance-news/components/archive-finance-news-dialog").then(
      (mod) => ({ default: mod.ArchiveFinanceNewsDialog }),
    ),
  { ssr: false },
);

const RestoreFinanceNewsDialog = dynamic(
  () =>
    import("@/src/features/finance-news/components/restore-finance-news-dialog").then(
      (mod) => ({ default: mod.RestoreFinanceNewsDialog }),
    ),
  { ssr: false },
);

const PermanentDeleteFinanceNewsDialog = dynamic(
  () =>
    import(
      "@/src/features/finance-news/components/permanent-delete-finance-news-dialog"
    ).then((mod) => ({ default: mod.PermanentDeleteFinanceNewsDialog })),
  { ssr: false },
);
import {
  FinanceNewsBulkActionsToolbar,
  type BulkFinanceNewsAction,
} from "@/src/features/finance-news/components/finance-news-bulk-actions-toolbar";

import type {
  FinanceNewsFilters,
  FinanceNewsListItem,
} from "@/src/features/finance-news/types/finance-news.types";

import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/finance-news/utils/finance-news-bulk.utils";

function getEmptyMessage(filters: FinanceNewsFilters): string {
  if (filters.status === "ARCHIVED") {
    return "No archived articles found.";
  }

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.categoryId ||
      filters.status,
  );

  if (hasActiveFilters) {
    return "No articles match your filters.";
  }

  return "Create your first article or adjust your filters.";
}

export function FinanceNewsPage() {
  const router = useRouter();

  const {
    items,
    total,
    catalogTotal,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useFinanceNews();

  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkFinanceNewsAction | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<FinanceNewsListItem | null>(null);
  const [statusMode, setStatusMode] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const { activateFinanceNews, isLoading: isActivating } =
    useActivateFinanceNews();
  const { deactivateFinanceNews, isLoading: isDeactivating } =
    useDeactivateFinanceNews();
  const { deleteFinanceNews, isLoading: isDeleting } =
    useDeleteFinanceNews();
  const { restoreFinanceNews, isLoading: isRestoring } =
    useRestoreFinanceNews();
  const {
    permanentDeleteFinanceNews,
    isLoading: isPermanentDeleting,
  } = usePermanentDeleteFinanceNews();

  const { bulkActivate, isPending: isBulkActivating } =
    useBulkActivateFinanceNews();
  const { bulkDeactivate, isPending: isBulkDeactivating } =
    useBulkDeactivateFinanceNews();
  const { bulkDelete, isPending: isBulkDeleting } =
    useBulkDeleteFinanceNews();
  const { bulkRestore, isPending: isBulkRestoring } =
    useBulkRestoreFinanceNews();
  const {
    bulkPermanentDelete,
    isPending: isBulkPermanentDeleting,
  } = useBulkPermanentDeleteFinanceNews();

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const emptyMessage = useMemo(() => getEmptyMessage(filters), [filters]);

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
        return getEligibleActivateIds(items, selectedIds);
      case "deactivate":
        return getEligibleDeactivateIds(items, selectedIds);
      case "delete":
        return getEligibleDeleteIds(items, selectedIds);
      case "restore":
        return getEligibleRestoreIds(items, selectedIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(items, selectedIds);
      default:
        return [];
    }
  }, [bulkConfirmAction, items, selectedIds]);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories({
          search: "",
          page: 1,
          pageSize: 100,
        });
        if (!cancelled) {
          setCategories(
            response.data.map((category) => ({
              id: category.id,
              name: category.name,
            })),
          );
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.categoryId,
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
    id: string;
    newPosition: number;
  }) => {
    try {
      setIsReordering(true);
      await financeNewsService.moveFinanceNews(payload);
      appToast.success("Article order updated");
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
              "article(s) activated successfully",
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
              "article(s) deactivated successfully",
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
              "article(s) archived successfully",
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
              "article(s) restored successfully",
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
              "article(s) permanently deleted",
            ),
          );
        }
        break;
    }

    if (result) {
      setSelectedIds([]);
      setBulkConfirmAction(null);
      await refetch();
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected articles?",
          description: `Activate ${count} selected article${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
          confirmVariant: "primary" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected articles?",
          description: `Deactivate ${count} selected article${count === 1 ? "" : "s"}? They will be removed from active ordering.`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive selected articles?",
          description: `Archive ${count} selected article${count === 1 ? "" : "s"}? They can be restored later.`,
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected articles?",
          description: `Restore ${count} archived article${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected articles?",
          description: `You are about to permanently delete ${count} article${count === 1 ? "" : "s"}. This action cannot be undone.`,
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

  if (error && items.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Financial News"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <FinanceNewsSummaryHeader
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
        status={filters.status}
        onStatusChange={(status) =>
          setFilters({
            ...filters,
            status,
          })
        }
        categoryId={filters.categoryId}
        onCategoryChange={(categoryId) =>
          setFilters({
            ...filters,
            categoryId,
          })
        }
        categories={categories}
        categoriesLoading={categoriesLoading}
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
        <FinanceNewsBulkActionsToolbar
          items={items}
          selectedIds={selectedIds}
          disabled={actionLoading || isFetching}
          onAction={setBulkConfirmAction}
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
                <span className="sr-only">Updating articles</span>
              ) : null}

              <FinanceNewsTable
                items={items}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                actionsDisabled={actionLoading || isFetching}
                selectionDisabled={actionLoading || isFetching}
                reorderDisabled={
                  isReordering ||
                  !!filters.status ||
                  !!(filters.search ?? "").trim() ||
                  !!filters.categoryId ||
                  isFetching ||
                  selectedIds.length > 0
                }
                emptyMessage={emptyMessage}
                onEdit={(item) => {
                  router.push(`/finance-news/${item.id}/edit`);
                }}
                onActivate={(item) => {
                  setSelectedItem(item);
                  setStatusMode("activate");
                }}
                onDeactivate={(item) => {
                  setSelectedItem(item);
                  setStatusMode("deactivate");
                }}
                onDelete={(item) => {
                  setSelectedItem(item);
                  setIsArchiveOpen(true);
                }}
                onRestore={(item) => {
                  setSelectedItem(item);
                  setIsRestoreOpen(true);
                }}
                onPermanentDelete={(item) => {
                  setSelectedItem(item);
                  setIsPermanentDeleteOpen(true);
                }}
                onReorder={handleReorder}
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
        <CreateFinanceNewsModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {statusMode !== null ? (
      <StatusFinanceNewsDialog
        open
        item={selectedItem}
        mode={statusMode ?? "activate"}
        isLoading={isActivating || isDeactivating}
        onClose={() => {
          setStatusMode(null);
        }}
        onConfirm={async () => {
          if (!selectedItem || !statusMode) {
            return;
          }

          const success =
            statusMode === "activate"
              ? await activateFinanceNews(selectedItem.id)
              : await deactivateFinanceNews(selectedItem.id);

          if (success) {
            setStatusMode(null);
            await refetch();
          }
        }}
      />
      ) : null}

      {isArchiveOpen ? (
      <ArchiveFinanceNewsDialog
        open
        item={selectedItem}
        isLoading={isDeleting}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await deleteFinanceNews(selectedItem.id);

          if (success) {
            setIsArchiveOpen(false);
            await refetch();
          }
        }}
      />
      ) : null}

      {isRestoreOpen ? (
      <RestoreFinanceNewsDialog
        open
        item={selectedItem}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await restoreFinanceNews(selectedItem.id);

          if (success) {
            setIsRestoreOpen(false);
            await refetch();
          }
        }}
      />
      ) : null}

      {isPermanentDeleteOpen ? (
      <PermanentDeleteFinanceNewsDialog
        open
        item={selectedItem}
        isLoading={isPermanentDeleting}
        onClose={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await permanentDeleteFinanceNews(
            selectedItem.id,
          );

          if (success) {
            setIsPermanentDeleteOpen(false);
            await refetch();
          }
        }}
      />
      ) : null}

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
