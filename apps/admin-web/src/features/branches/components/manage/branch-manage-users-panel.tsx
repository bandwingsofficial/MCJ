"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { BranchUserFiltersBar } from "@/src/features/branch-users/components/branch-user-filters";
import { BranchUserTable } from "@/src/features/branch-users/components/branch-user-table";
import { CreateBranchUserModal } from "@/src/features/branch-users/components/create-branch-user-modal";
import { UpdateBranchUserModal } from "@/src/features/branch-users/components/update-branch-user-modal";
import { ResetPasswordDialog } from "@/src/features/branch-users/components/reset-password-dialog";

import { useBranchUsers } from "@/src/features/branch-users/hooks/use-branch-users";
import { useActivateBranchUser } from "@/src/features/branch-users/hooks/use-activate-branch-user";
import { useDeactivateBranchUser } from "@/src/features/branch-users/hooks/use-deactivate-branch-user";
import { useDeleteBranchUser } from "@/src/features/branch-users/hooks/use-delete-branch-user";
import { useRestoreBranchUser } from "@/src/features/branch-users/hooks/use-restore-branch-user";
import { usePermanentDeleteBranchUser } from "@/src/features/branch-users/hooks/use-permanent-delete-branch-user";

import type { BranchUserListItem } from "@/src/features/branch-users/types/branch-user.types";

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

  if (isInitialLoading) {
    return <SkeletonTable rows={8} />;
  }

  if (error && branchUsers.length === 0) {
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Users
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage users for {branchName}
            </p>
          </div>

          <Button
            onClick={() => setIsCreateOpen(true)}
            disabled={tableDisabled}
            className="h-9 rounded-lg px-4"
          >
            Create User
          </Button>
        </div>

        <Card className="overflow-hidden p-0 shadow-sm">
          <div className="border-b border-slate-200 px-3 py-2.5">
            <BranchUserFiltersBar
              filters={filters}
              onChange={setFilters}
            />
          </div>

          {error ? (
            <div className="border-b border-red-100 bg-red-50 px-3.5 py-2 text-sm text-red-700">
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

          <div aria-busy={isLoading} className="relative overflow-x-auto">
            {branchUsers.length === 0 ? (
              <EmptyState
                title="No Users Found"
                description={
                  hasActiveFilters
                    ? "No users match the current filters."
                    : "This branch does not have any users yet."
                }
              />
            ) : (
              <BranchUserTable
                branchUsers={branchUsers}
                actionsDisabled={tableDisabled}
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
            )}
          </div>

          {count > 0 ? (
            <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                <span className="leading-9">
                  Showing {from}–{to} of {count}
                </span>

                <label className="flex items-center gap-2 leading-9">
                  <span className="whitespace-nowrap">
                    Rows per page
                  </span>
                  <select
                    className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
                    value={filters.pageSize}
                    disabled={tableDisabled}
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
                page={filters.page}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setFilters({
                    ...filters,
                    page,
                  })
                }
              />
            </div>
          ) : null}
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
        description="Are you sure you want to restore this user?"
        confirmLabel="Restore"
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
