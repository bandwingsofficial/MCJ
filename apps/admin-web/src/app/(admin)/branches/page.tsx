"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import {
  Branch,
  BranchListItem,
} from "@/src/features/branches/types/branch.types";

import { useBranches } from "@/src/features/branches/hooks/use-branches";

import { useBranch } from "@/src/features/branches/hooks/use-branch";

import { useDeleteBranch } from "@/src/features/branches/hooks/use-delete-branch";

import { useRestoreBranch } from "@/src/features/branches/hooks/use-restore-branch";

import { useUpdateStatus } from "@/src/features/branches/hooks/use-update-status";

import { BranchFilters } from "@/src/features/branches/components/branch-filters";

import { BranchTable } from "@/src/features/branches/components/branch-table";

import { CreateBranchModal } from "@/src/features/branches/components/create-branch-modal";

import { UpdateBranchModal } from "@/src/features/branches/components/update-branch-modal";

import { BranchDetailsDrawer } from "@/src/features/branches/components/branch-details-drawer";

import { DeleteBranchDialog } from "@/src/features/branches/components/delete-branch-dialog";

import { RestoreBranchDialog } from "@/src/features/branches/components/restore-branch-dialog";

import { StatusBranchDialog } from "@/src/features/branches/components/status-branch-dialog";

export default function BranchesPage() {
  const {
    branches,
    count,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
  } = useBranches();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [isUpdateOpen, setIsUpdateOpen] =
    useState(false);

  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const [isDeleteOpen, setIsDeleteOpen] =
    useState(false);

  const [isRestoreOpen, setIsRestoreOpen] =
    useState(false);

  const [isStatusOpen, setIsStatusOpen] =
    useState(false);

  const [selectedBranchId, setSelectedBranchId] =
    useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] =
    useState<BranchListItem | null>(null);

  const {
    branch,
  } = useBranch(
    selectedBranchId ?? undefined
  );

  const {
    deleteBranch,
    isPending: isDeleting,
  } = useDeleteBranch();

  const {
    restoreBranch,
    isPending: isRestoring,
  } = useRestoreBranch();

  const {
    updateStatus,
    isPending: isUpdatingStatus,
  } = useUpdateStatus();

  const handleRefresh =
    async () => {
      await refetch();
    };

  const handleView = (
    branch: BranchListItem
  ) => {
    setSelectedBranchId(branch.id);

    setIsDrawerOpen(true);
  };

  const handleEdit = (
    branch: BranchListItem
  ) => {
    setSelectedBranchId(branch.id);

    setSelectedBranch(branch);

    setIsUpdateOpen(true);
  };

  const handleDelete = (
    branch: BranchListItem
  ) => {
    setSelectedBranch(branch);

    setIsDeleteOpen(true);
  };

  const handleRestore = (
    branch: BranchListItem
  ) => {
    setSelectedBranch(branch);

    setIsRestoreOpen(true);
  };

  const handleStatus = (
    branch: BranchListItem
  ) => {
    setSelectedBranch(branch);

    setIsStatusOpen(true);
  };

  const currentBranch =
    useMemo(() => {
      return branch ?? null;
    }, [branch]);

  if (isLoading) {
    return (
      <SkeletonTable rows={10} />
    );
  }

  if (error) {
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
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description={`Manage organization branches (${count})`}
        actions={
          <Button
            onClick={() =>
              setIsCreateOpen(true)
            }
          >
            Create Branch
          </Button>
        }
      />

      <BranchFilters
        filters={filters}
        onChange={setFilters}
      />

      {branches.length === 0 ? (
        <EmptyState
          title="No Branches Found"
          description="Create your first branch to get started."
          action={
            <Button
              onClick={() =>
                setIsCreateOpen(true)
              }
            >
              Create Branch
            </Button>
          }
        />
      ) : (
        <BranchTable
          branches={branches}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleStatus={
            handleStatus
          }
        />
      )}

      <CreateBranchModal
        open={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSuccess={() => {
          void handleRefresh();
        }}
      />

      <UpdateBranchModal
        open={isUpdateOpen}
        branch={
          currentBranch as Branch
        }
        onClose={() =>
          setIsUpdateOpen(false)
        }
        onSuccess={() => {
          void handleRefresh();
        }}
      />

      <BranchDetailsDrawer
        open={isDrawerOpen}
        branch={currentBranch}
        onClose={() =>
          setIsDrawerOpen(false)
        }
      />

      <DeleteBranchDialog
        open={isDeleteOpen}
        branch={selectedBranch}
        isLoading={isDeleting}
        onClose={() =>
          setIsDeleteOpen(false)
        }
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          await deleteBranch(
            selectedBranch.id
          );

          setIsDeleteOpen(false);

          await handleRefresh();
        }}
      />

      <RestoreBranchDialog
        open={isRestoreOpen}
        branch={selectedBranch}
        isLoading={isRestoring}
        onClose={() =>
          setIsRestoreOpen(false)
        }
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          await restoreBranch(
            selectedBranch.id
          );

          setIsRestoreOpen(false);

          await handleRefresh();
        }}
      />

      <StatusBranchDialog
        open={isStatusOpen}
        branch={selectedBranch}
        isLoading={
          isUpdatingStatus
        }
        onClose={() =>
          setIsStatusOpen(false)
        }
        onConfirm={async () => {
          if (!selectedBranch) {
            return;
          }

          await updateStatus(
            selectedBranch.id,
            selectedBranch.status ===
              "ACTIVE"
              ? "INACTIVE"
              : "ACTIVE"
          );

          setIsStatusOpen(false);

          await handleRefresh();
        }}
      />
    </div>
  );
}