"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { BranchUserTable } from "@/src/features/branch-users/components/branch-user-table";
import { CreateBranchUserModal } from "@/src/features/branch-users/components/create-branch-user-modal";
import { UpdateBranchUserModal } from "@/src/features/branch-users/components/update-branch-user-modal";
import { ResetPasswordDialog } from "@/src/features/branch-users/components/reset-password-dialog";
import {
  BRANCH_USER_ROLE_OPTIONS,
  BRANCH_USER_STATUS_OPTIONS,
} from "@/src/features/branch-users/constants/branch-user.constants";

import { useBranchUsers } from "@/src/features/branch-users/hooks/use-branch-users";
import { useActivateBranchUser } from "@/src/features/branch-users/hooks/use-activate-branch-user";
import { useDeactivateBranchUser } from "@/src/features/branch-users/hooks/use-deactivate-branch-user";
import { useDeleteBranchUser } from "@/src/features/branch-users/hooks/use-delete-branch-user";
import { useRestoreBranchUser } from "@/src/features/branch-users/hooks/use-restore-branch-user";
import { usePermanentDeleteBranchUser } from "@/src/features/branch-users/hooks/use-permanent-delete-branch-user";

import type {
  BranchUserFilters,
  BranchUserListItem,
} from "@/src/features/branch-users/types/branch-user.types";

type StatusConfirmAction = "activate" | "deactivate";

interface Props {
  branchId: string;
  branchName: string;
  branchCode: string;
  disabled?: boolean;
}

export function BranchManageUsersPanel({
  branchId,
  branchName,
  branchCode,
  disabled = false,
}: Props) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] =
    useState<BranchUserListItem | null>(null);
  const [resetPasswordUser, setResetPasswordUser] =
    useState<BranchUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<BranchUserListItem | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    user: BranchUserListItem;
    action: StatusConfirmAction;
  } | null>(null);
  const [restoreTarget, setRestoreTarget] =
    useState<BranchUserListItem | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<BranchUserListItem | null>(null);

  const {
    branchUsers,
    count,
    filters,
    setFilters,
    isInitialLoading,
    isLoading,
    error,
    refetch,
  } = useBranchUsers({ branchId });

  const {
    activateBranchUser,
    isLoading: isActivating,
  } = useActivateBranchUser();
  const {
    deactivateBranchUser,
    isLoading: isDeactivating,
  } = useDeactivateBranchUser();
  const {
    deleteBranchUser,
    isLoading: isDeleting,
  } = useDeleteBranchUser();
  const {
    restoreBranchUser,
    isLoading: isRestoring,
  } = useRestoreBranchUser();
  const {
    permanentDeleteBranchUser,
    isLoading: isPermanentlyDeleting,
  } = usePermanentDeleteBranchUser();

  const actionLoading =
    isActivating ||
    isDeactivating ||
    isDeleting ||
    isRestoring ||
    isPermanentlyDeleting;

  const tableDisabled = disabled || isLoading || actionLoading;

  const fixedBranch = useMemo(
    () => ({
      id: branchId,
      label: `${branchName} (${branchCode})`,
    }),
    [branchId, branchName, branchCode],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(count / filters.pageSize),
  );

  useEffect(() => {
    if (filters.page > totalPages) {
      setFilters({
        ...filters,
        page: totalPages,
      });
    }
  }, [count, filters, setFilters, totalPages]);

  const from =
    count === 0
      ? 0
      : (filters.page - 1) * filters.pageSize + 1;
  const to = Math.min(filters.page * filters.pageSize, count);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    Boolean(filters.role) ||
    Boolean(filters.status);

  const updateFilters = (next: BranchUserFilters) => {
    setFilters(next);
  };

  if (error && branchUsers.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed to load users"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        <header className="px-1 py-1">
          <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Users
              </h2>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Users:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isInitialLoading ? "—" : count}
                </span>
              </span>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:flex-1 lg:justify-end">
              <div className="w-full sm:w-[280px]">
                <SearchInput
                  value={filters.search}
                  placeholder="Search users..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={(value) =>
                    updateFilters({
                      ...filters,
                      search: value,
                      page: 1,
                    })
                  }
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={filters.role ?? "ALL"}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    updateFilters({
                      ...filters,
                      role:
                        value === "ALL"
                          ? undefined
                          : (value as BranchUserFilters["role"]),
                      page: 1,
                    })
                  }
                  options={[
                    { label: "All Roles", value: "ALL" },
                    ...BRANCH_USER_ROLE_OPTIONS,
                  ]}
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={filters.status ?? "ALL"}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    updateFilters({
                      ...filters,
                      status:
                        value === "ALL"
                          ? undefined
                          : (value as BranchUserFilters["status"]),
                      page: 1,
                    })
                  }
                  options={[...BRANCH_USER_STATUS_OPTIONS]}
                />
              </div>

              <Button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                disabled={tableDisabled}
                className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:opacity-50 sm:w-auto"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Create User
              </Button>
            </div>
          </div>
        </header>

        <Card className="min-w-0 overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
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

              <div aria-busy={isLoading} className="relative min-w-0">
                {isLoading ? (
                  <span className="sr-only">Updating users</span>
                ) : null}

                <BranchUserTable
                  branchUsers={branchUsers}
                  actionsDisabled={tableDisabled}
                  emptyTitle="No Users Found"
                  emptyDescription={
                    hasActiveFilters
                      ? "No users match the current filters."
                      : "This branch does not have any users yet."
                  }
                  onEdit={setEditUser}
                  onActivate={(branchUser) =>
                    setStatusTarget({
                      user: branchUser,
                      action: "activate",
                    })
                  }
                  onDeactivate={(branchUser) =>
                    setStatusTarget({
                      user: branchUser,
                      action: "deactivate",
                    })
                  }
                  onDelete={setDeleteTarget}
                  onResetPassword={setResetPasswordUser}
                  onRestore={setRestoreTarget}
                  onPermanentDelete={setPermanentDeleteTarget}
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                  <span>
                    Showing {from}–{to} of {count}
                  </span>

                  <label className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">Rows per page</span>
                    <select
                      className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                      value={filters.pageSize}
                      disabled={tableDisabled}
                      onChange={(event) =>
                        updateFilters({
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
                  page={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) =>
                    updateFilters({
                      ...filters,
                      page,
                    })
                  }
                />
              </div>
            </>
          )}
        </Card>
      </div>

      <CreateBranchUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
        fixedBranch={fixedBranch}
      />

      {editUser ? (
        <UpdateBranchUserModal
          open={Boolean(editUser)}
          branchUser={editUser}
          fixedBranch={fixedBranch}
          onClose={() => setEditUser(null)}
          onSuccess={async () => {
            await refetch();
            setEditUser(null);
          }}
        />
      ) : null}

      {resetPasswordUser ? (
        <ResetPasswordDialog
          open={Boolean(resetPasswordUser)}
          userId={resetPasswordUser.id}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={async () => {
            await refetch();
            setResetPasswordUser(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={statusTarget?.action === "activate"}
        title="Activate User?"
        description="Are you sure you want to activate this user?"
        confirmLabel="Activate"
        confirmVariant="primary"
        loading={isActivating}
        onConfirm={async () => {
          if (!statusTarget) {
            return;
          }

          const success = await activateBranchUser(
            statusTarget.user.id
          );

          if (success) {
            setStatusTarget(null);
            await refetch();
          }
        }}
        onCancel={() => {
          if (!isActivating) {
            setStatusTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={statusTarget?.action === "deactivate"}
        title="Deactivate User?"
        description="Are you sure you want to deactivate this user?"
        confirmLabel="Deactivate"
        confirmVariant="danger"
        loading={isDeactivating}
        onConfirm={async () => {
          if (!statusTarget) {
            return;
          }

          const success = await deactivateBranchUser(
            statusTarget.user.id
          );

          if (success) {
            setStatusTarget(null);
            await refetch();
          }
        }}
        onCancel={() => {
          if (!isDeactivating) {
            setStatusTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete User?"
        description="Are you sure you want to delete this user?"
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={async () => {
          if (!deleteTarget) {
            return;
          }

          const success = await deleteBranchUser(
            deleteTarget.id
          );

          if (success) {
            setDeleteTarget(null);
            await refetch();
          }
        }}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restore User?"
        description="This user will become active again."
        confirmLabel="Restore User"
        confirmVariant="primary"
        loading={isRestoring}
        onConfirm={async () => {
          if (!restoreTarget) {
            return;
          }

          const success = await restoreBranchUser(
            restoreTarget.id
          );

          if (success) {
            setRestoreTarget(null);
            await refetch();
          }
        }}
        onCancel={() => {
          if (!isRestoring) {
            setRestoreTarget(null);
          }
        }}
      />

      <ConfirmDialog
        open={permanentDeleteTarget !== null}
        title="Permanently Delete User?"
        description="This action cannot be undone."
        confirmLabel="Permanently Delete"
        confirmVariant="danger"
        loading={isPermanentlyDeleting}
        onConfirm={async () => {
          if (!permanentDeleteTarget) {
            return;
          }

          const success = await permanentDeleteBranchUser(
            permanentDeleteTarget.id
          );

          if (success) {
            setPermanentDeleteTarget(null);
            await refetch();
          }
        }}
        onCancel={() => {
          if (!isPermanentlyDeleting) {
            setPermanentDeleteTarget(null);
          }
        }}
      />
    </>
  );
}
