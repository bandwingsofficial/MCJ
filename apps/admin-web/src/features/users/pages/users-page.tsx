"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  adminUsersService,
  type AdminUserListItem,
} from "@/src/features/users/services/admin-users.service";
import { UserSummaryHeader } from "@/src/features/users/components/user-summary-header";
import type {
  UserAccountStatusFilter,
  UserReferralFilter,
} from "@/src/features/users/components/user-summary-header";
import { UserTable } from "@/src/features/users/components/user-table";
import { UserViewDialog } from "@/src/features/users/components/user-view-dialog";
import { UserSuspendDialog } from "@/src/features/users/components/user-suspend-dialog";
import { UserPermanentDeleteDialog } from "@/src/features/users/components/user-permanent-delete-dialog";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 20;

export function UsersPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountStatus, setAccountStatus] =
    useState<UserAccountStatusFilter>("ALL");
  const [referral, setReferral] = useState<UserReferralFilter>("ALL");

  const [viewTarget, setViewTarget] = useState<AdminUserListItem | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUserListItem | null>(
    null,
  );
  const [unsuspendTarget, setUnsuspendTarget] =
    useState<AdminUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(
    null,
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const listQuery = useQuery({
    queryKey: [
      "admin-users",
      page,
      pageSize,
      debouncedSearch,
      accountStatus,
      referral,
    ],
    queryFn: () =>
      adminUsersService.list({
        search: debouncedSearch || undefined,
        accountStatus,
        referral,
        take: pageSize,
        skip: (page - 1) * pageSize,
      }),
  });

  const suspendMutation = useMutation({
    mutationFn: ({
      user,
      reason,
    }: {
      user: AdminUserListItem;
      reason?: string;
    }) => adminUsersService.suspend(user.id, reason),
    onSuccess: () => {
      appToast.success("User suspended");
      setSuspendTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const unsuspendMutation = useMutation({
    mutationFn: (user: AdminUserListItem) => adminUsersService.unsuspend(user.id),
    onSuccess: () => {
      appToast.success("User unsuspended");
      setUnsuspendTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (user: AdminUserListItem) =>
      adminUsersService.deletePermanently(user.id, "Deleted by admin"),
    onSuccess: () => {
      appToast.success("User permanently deleted");
      setDeleteTarget(null);
      setViewTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => appToast.error(getErrorMessage(err)),
  });

  const total = listQuery.data?.total ?? 0;
  const items = listQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const hasActiveFilters = Boolean(
    debouncedSearch || accountStatus !== "ALL" || referral !== "ALL",
  );

  const isInitialLoading = listQuery.isLoading && !listQuery.data;
  const isFetching = listQuery.isFetching;
  const actionLoading =
    suspendMutation.isPending ||
    unsuspendMutation.isPending ||
    deleteMutation.isPending;

  const emptyCopy = useMemo(() => {
    if (hasActiveFilters) {
      return {
        title: "No users match your current filters",
        description: "Try adjusting your search or filter criteria.",
      };
    }
    return {
      title: "No Users Yet",
      description: "Portal users will appear here.",
    };
  }, [hasActiveFilters]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [total, page, pageSize]);

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setAccountStatus("ALL");
    setReferral("ALL");
    setPage(1);
  };

  if (listQuery.isError && !listQuery.data) {
    return (
      <ErrorState
        title="Failed to load users"
        description={getErrorMessage(listQuery.error)}
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <UserSummaryHeader
        total={total}
        isLoading={isInitialLoading}
        search={searchInput}
        accountStatus={accountStatus}
        referral={referral}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchInput}
        onAccountStatusChange={(value) => {
          setAccountStatus(value);
          setPage(1);
        }}
        onReferralChange={(value) => {
          setReferral(value);
          setPage(1);
        }}
        onClearFilters={clearFilters}
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
        {isInitialLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <>
            <div aria-busy={isFetching} className="relative">
              {isFetching ? (
                <span className="sr-only">Updating users</span>
              ) : null}

              <UserTable
                users={items}
                actionsDisabled={actionLoading || isFetching}
                emptyTitle={emptyCopy.title}
                emptyDescription={emptyCopy.description}
                onView={setViewTarget}
                onSuspend={setSuspendTarget}
                onUnsuspend={setUnsuspendTarget}
                onPermanentDelete={setDeleteTarget}
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
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
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
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>

      <UserViewDialog
        open={Boolean(viewTarget)}
        user={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <UserSuspendDialog
        open={Boolean(suspendTarget)}
        user={suspendTarget}
        loading={suspendMutation.isPending}
        onClose={() => setSuspendTarget(null)}
        onConfirm={(reason) => {
          if (suspendTarget) {
            suspendMutation.mutate({ user: suspendTarget, reason });
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(unsuspendTarget)}
        title="Unsuspend user?"
        description={
          unsuspendTarget
            ? `${unsuspendTarget.name} will be able to log in again.`
            : ""
        }
        confirmLabel="Unsuspend"
        confirmVariant="success"
        loading={unsuspendMutation.isPending}
        onCancel={() => setUnsuspendTarget(null)}
        onConfirm={() => {
          if (unsuspendTarget) {
            unsuspendMutation.mutate(unsuspendTarget);
          }
        }}
      />

      <UserPermanentDeleteDialog
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        loading={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget);
          }
        }}
      />
    </div>
  );
}
