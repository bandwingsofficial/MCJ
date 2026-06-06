"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Card } from "@/src/shared/components/ui/card";
import { ResetPasswordDialog } from "@/src/features/branch-users/components/reset-password-dialog";
import { useBranchUsers } from "@/src/features/branch-users/hooks/use-branch-users";
import { useBranches } from "@/src/features/branches/hooks/use-branches";

import { useActivateBranchUser } from "@/src/features/branch-users/hooks/use-activate-branch-user";
import { useDeactivateBranchUser } from "@/src/features/branch-users/hooks/use-deactivate-branch-user";
import { useDeleteBranchUser } from "@/src/features/branch-users/hooks/use-delete-branch-user";
import { useRestoreBranchUser } from "@/src/features/branch-users/hooks/use-restore-branch-user";
import { useResetPassword } from "@/src/features/branch-users/hooks/use-reset-password";

import { BranchUserFiltersBar } from "@/src/features/branch-users/components/branch-user-filters";
import { BranchUserTable } from "@/src/features/branch-users/components/branch-user-table";

import { CreateBranchUserModal } from "@/src/features/branch-users/components/create-branch-user-modal";
import { UpdateBranchUserModal } from "@/src/features/branch-users/components/update-branch-user-modal";

import {
  BranchUserListItem,
} from "@/src/features/branch-users/types/branch-user.types";

export function BranchUsersPage() {
  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState<BranchUserListItem | null>(
      null
    );
    const [
  resetPasswordUser,
  setResetPasswordUser,
] =
  useState<BranchUserListItem | null>(
    null
  );

  const {
    branchUsers,
    count,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
  } = useBranchUsers();

  const {
    branches,
  } = useBranches();

  const {
    activateBranchUser,
  } = useActivateBranchUser();

  const {
    deactivateBranchUser,
  } = useDeactivateBranchUser();

  const {
    deleteBranchUser,
  } = useDeleteBranchUser();

  const {
    restoreBranchUser,
  } = useRestoreBranchUser();

 
  const branchOptions =
    useMemo(
      () =>
        branches.map(
          (branch) => ({
            label:
              branch.branchName,
            value: branch.id,
          })
        ),
      [branches]
    );

  const filteredUsers =
    useMemo(() => {
      let users = [...branchUsers];

      if (filters.search.trim()) {
        const search =
          filters.search.toLowerCase();

        users = users.filter(
          (user) =>
            user.firstName
              .toLowerCase()
              .includes(search) ||
            user.lastName
              .toLowerCase()
              .includes(search) ||
            user.email
              .toLowerCase()
              .includes(search) ||
            user.phone.includes(
              search
            )
        );
      }

      if (filters.role) {
        users = users.filter(
          (user) =>
            user.role ===
            filters.role
        );
      }

      if (
        filters.status ===
        "ACTIVE"
      ) {
        users = users.filter(
          (user) =>
            user.isActive === true
        );
      }

      if (
        filters.status ===
        "INACTIVE"
      ) {
        users = users.filter(
          (user) =>
            user.isActive === false
        );
      }

      return users;
    }, [
      branchUsers,
      filters.search,
      filters.role,
      filters.status,
    ]);

  if (isLoading) {
    return <SkeletonTable rows={10} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Branch Users"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Branch Users"
          description={`Manage all branch users (${filteredUsers.length})`}
          actions={
            <Button
              onClick={() =>
                setIsCreateOpen(
                  true
                )
              }
            >
              Create User
            </Button>
          }
        />

        <Card>
          <div className="p-0">
            <BranchUserFiltersBar
              filters={filters}
              onChange={
                setFilters
              }
            />
          </div>
        </Card>

        {filteredUsers.length ===
        0 ? (
          <EmptyState
            title="No Branch Users Found"
            description="Create your first branch user."
          />
        ) : (
          <BranchUserTable
            branchUsers={
              filteredUsers
            }
            includeDeleted={
              filters.includeDeleted
            }
            onEdit={(
              branchUser
            ) =>
              setSelectedUser(
                branchUser
              )
            }
            onActivate={async (
              branchUser
            ) => {
              const success =
                await activateBranchUser(
                  branchUser.id
                );

              if (success) {
                await refetch();
              }
            }}
            onDeactivate={async (
              branchUser
            ) => {
              const success =
                await deactivateBranchUser(
                  branchUser.id
                );

              if (success) {
                await refetch();
              }
            }}
            onDelete={async (
              branchUser
            ) => {
              const success =
                await deleteBranchUser(
                  branchUser.id
                );

              if (success) {
                await refetch();
              }
            }}
            onRestore={async (
              branchUser
            ) => {
              const success =
                await restoreBranchUser(
                  branchUser.id
                );

              if (success) {
                await refetch();
              }
            }}
            onResetPassword={(
  branchUser
) => {
  setResetPasswordUser(
    branchUser
  );
}}
          />
        )}
      </div>

      <CreateBranchUserModal
        open={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSuccess={refetch}
        branchOptions={
          branchOptions
        }
      />

      {selectedUser && (
        <UpdateBranchUserModal
          open={Boolean(
            selectedUser
          )}
          branchUser={
            selectedUser
          }
          branchOptions={
            branchOptions
          }
          onClose={() =>
            setSelectedUser(
              null
            )
          }
          onSuccess={refetch}
        />
      )}

      {resetPasswordUser && (
  <ResetPasswordDialog
    open={Boolean(
      resetPasswordUser
    )}
    userId={
      resetPasswordUser.id
    }
    userName={`${resetPasswordUser.firstName} ${resetPasswordUser.lastName}`}
    onClose={() =>
      setResetPasswordUser(
        null
      )
    }
    onSuccess={async () => {
      await refetch();

      setResetPasswordUser(
        null
      );
    }}
  />
)}
    </>
  );
}