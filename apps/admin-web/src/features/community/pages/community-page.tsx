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

import { useCommunityPosts } from "@/src/features/community/hooks/use-community-posts";
import {
  useActivateCommunityPost,
  useDeactivateCommunityPost,
  useDeleteCommunityPost,
  useRestoreCommunityPost,
  usePermanentDeleteCommunityPost,
} from "@/src/features/community/hooks/use-community-actions";
import { useBulkActivateCommunityPost } from "@/src/features/community/hooks/use-bulk-activate-community-post";
import { useBulkDeactivateCommunityPost } from "@/src/features/community/hooks/use-bulk-deactivate-community-post";
import { useBulkDeleteCommunityPost } from "@/src/features/community/hooks/use-bulk-delete-community-post";
import { useBulkRestoreCommunityPost } from "@/src/features/community/hooks/use-bulk-restore-community-post";
import { useBulkPermanentDeleteCommunityPost } from "@/src/features/community/hooks/use-bulk-permanent-delete-community-post";

import { CommunityFeedGrid } from "@/src/features/community/components/community-feed-grid";
import { CommunitySummaryHeader } from "@/src/features/community/components/community-summary-header";
const CreateCommunityPostModal = dynamic(
  () =>
    import("@/src/features/community/components/create-community-post-modal").then(
      (mod) => ({ default: mod.CreateCommunityPostModal }),
    ),
  { ssr: false },
);

const EditCommunityPostModal = dynamic(
  () =>
    import("@/src/features/community/components/edit-community-post-modal").then(
      (mod) => ({ default: mod.EditCommunityPostModal }),
    ),
  { ssr: false },
);

const StatusCommunityPostDialog = dynamic(
  () =>
    import("@/src/features/community/components/status-community-post-dialog").then(
      (mod) => ({ default: mod.StatusCommunityPostDialog }),
    ),
  { ssr: false },
);

const ArchiveCommunityPostDialog = dynamic(
  () =>
    import("@/src/features/community/components/archive-community-post-dialog").then(
      (mod) => ({ default: mod.ArchiveCommunityPostDialog }),
    ),
  { ssr: false },
);

const RestoreCommunityPostDialog = dynamic(
  () =>
    import("@/src/features/community/components/restore-community-post-dialog").then(
      (mod) => ({ default: mod.RestoreCommunityPostDialog }),
    ),
  { ssr: false },
);

const PermanentDeleteCommunityPostDialog = dynamic(
  () =>
    import(
      "@/src/features/community/components/permanent-delete-community-post-dialog"
    ).then((mod) => ({ default: mod.PermanentDeleteCommunityPostDialog })),
  { ssr: false },
);
import {
  CommunityBulkActionsToolbar,
  type BulkCommunityAction,
} from "@/src/features/community/components/community-bulk-actions-toolbar";

import { communityService } from "@/src/features/community/services/community.service";

import type {
  CommunityFilters,
  CommunityPostDetails,
  CommunityPostListItem,
} from "@/src/features/community/types/community.types";

import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/community/utils/community-bulk.utils";

function getEmptyMessage(filters: CommunityFilters): string {
  if (filters.status === "ARCHIVED") {
    return "No archived posts found.";
  }

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() || filters.status || filters.type,
  );

  if (hasActiveFilters) {
    return "No posts match your filters.";
  }

  return "Create your first post or adjust your filters.";
}

export function CommunityPage() {
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
  } = useCommunityPosts();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkCommunityAction | null>(null);
  const [selectedItem, setSelectedItem] =
    useState<CommunityPostListItem | null>(null);
  const [editPost, setEditPost] = useState<CommunityPostDetails | null>(null);
  const [statusMode, setStatusMode] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const { activateCommunityPost, isLoading: isActivating } =
    useActivateCommunityPost();
  const { deactivateCommunityPost, isLoading: isDeactivating } =
    useDeactivateCommunityPost();
  const { deleteCommunityPost, isLoading: isDeleting } =
    useDeleteCommunityPost();
  const { restoreCommunityPost, isLoading: isRestoring } =
    useRestoreCommunityPost();
  const {
    permanentDeleteCommunityPost,
    isLoading: isPermanentDeleting,
  } = usePermanentDeleteCommunityPost();

  const { bulkActivate, isPending: isBulkActivating } =
    useBulkActivateCommunityPost();
  const { bulkDeactivate, isPending: isBulkDeactivating } =
    useBulkDeactivateCommunityPost();
  const { bulkDelete, isPending: isBulkDeleting } =
    useBulkDeleteCommunityPost();
  const { bulkRestore, isPending: isBulkRestoring } =
    useBulkRestoreCommunityPost();
  const {
    bulkPermanentDelete,
    isPending: isBulkPermanentDeleting,
  } = useBulkPermanentDeleteCommunityPost();

  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const emptyMessage = useMemo(() => getEmptyMessage(filters), [filters]);

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() || filters.status || filters.type,
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
    isEditLoading ||
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
    setSelectedIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.type,
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

  const handleEdit = async (item: CommunityPostListItem) => {
    try {
      setIsEditLoading(true);
      const response = await communityService.getCommunityPost(item.id);
      setEditPost(response.data);
      setIsEditOpen(true);
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Failed to load post for editing",
      );
    } finally {
      setIsEditLoading(false);
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
            formatBulkResultToast(result, "post(s) activated successfully"),
          );
        }
        break;
      case "deactivate":
        result = await bulkDeactivate(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(result, "post(s) deactivated successfully"),
          );
        }
        break;
      case "delete":
        result = await bulkDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(result, "post(s) archived successfully"),
          );
        }
        break;
      case "restore":
        result = await bulkRestore(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(result, "post(s) restored successfully"),
          );
        }
        break;
      case "permanent-delete":
        result = await bulkPermanentDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(result, "post(s) permanently deleted"),
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
          title: "Activate selected posts?",
          description: `Activate ${count} selected post${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
          confirmVariant: "primary" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected posts?",
          description: `Deactivate ${count} selected post${count === 1 ? "" : "s"}? They will be removed from active listings.`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive selected posts?",
          description: `Archive ${count} selected post${count === 1 ? "" : "s"}? They can be restored later.`,
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected posts?",
          description: `Restore ${count} archived post${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected posts?",
          description: `You are about to permanently delete ${count} post${count === 1 ? "" : "s"}. This action cannot be undone.`,
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
        title="Failed To Load Community Posts"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <CommunitySummaryHeader
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
        type={filters.type}
        onTypeChange={(type) =>
          setFilters({
            ...filters,
            type,
          })
        }
        hasActiveFilters={hasActiveFilters}
        onClearFilters={() =>
          setFilters({
            ...filters,
            search: "",
            status: undefined,
            type: undefined,
            page: 1,
          })
        }
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
        <CommunityBulkActionsToolbar
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
                <span className="sr-only">Updating posts</span>
              ) : null}

              <CommunityFeedGrid
                items={items}
                selectedIds={selectedIds}
                emptyMessage={emptyMessage}
                selectionDisabled={actionLoading || isFetching}
                actionsDisabled={actionLoading || isFetching}
                onSelectionChange={setSelectedIds}
                onManage={(item) =>
                  router.push(`/community/${item.id}/manage`)
                }
                onEdit={handleEdit}
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
        <CreateCommunityPostModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {isEditOpen && editPost ? (
        <EditCommunityPostModal
          open={isEditOpen}
          post={editPost}
          onClose={() => {
            setIsEditOpen(false);
            setEditPost(null);
          }}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {statusMode !== null ? (
      <StatusCommunityPostDialog
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
              ? await activateCommunityPost(selectedItem.id)
              : await deactivateCommunityPost(selectedItem.id);

          if (success) {
            setStatusMode(null);
            await refetch();
          }
        }}
      />
      ) : null}

      {isArchiveOpen ? (
      <ArchiveCommunityPostDialog
        open
        item={selectedItem}
        isLoading={isDeleting}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await deleteCommunityPost(selectedItem.id);

          if (success) {
            setIsArchiveOpen(false);
            await refetch();
          }
        }}
      />
      ) : null}

      {isRestoreOpen ? (
      <RestoreCommunityPostDialog
        open
        item={selectedItem}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await restoreCommunityPost(selectedItem.id);

          if (success) {
            setIsRestoreOpen(false);
            await refetch();
          }
        }}
      />
      ) : null}

      {isPermanentDeleteOpen ? (
      <PermanentDeleteCommunityPostDialog
        open
        item={selectedItem}
        isLoading={isPermanentDeleting}
        onClose={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          if (!selectedItem) {
            return;
          }

          const success = await permanentDeleteCommunityPost(
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
