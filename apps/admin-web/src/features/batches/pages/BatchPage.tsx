"use client";

import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  useActivateBatch,
  useBatch,
  useBatches,
  useDeactivateBatch,
  useDeleteBatch,
  useRestoreBatch,
} from "@/src/features/batches";

import type {
  BatchMode,
  BatchStatus,
} from "@/src/features/batches/types/batch.types";

import { BatchFilters } from "@/src/features/batches/components/BatchFilters";
import { BatchTable } from "@/src/features/batches/components/BatchTable";
import { BatchSkeleton } from "@/src/features/batches/components/BatchSkeleton";
import { EmptyBatch } from "@/src/features/batches/components/EmptyBatch";
import { BatchDeleteDialog } from "@/src/features/batches/components/BatchDeleteDialog";
import { BatchDetailsDrawer } from "@/src/features/batches/components/BatchDetailsDrawer";
import { BatchForm } from "@/src/features/batches/components/BatchForm";

export function BatchPage() {
  const router = useRouter();
  const {
    batches,
    isLoading,
    error,
    refetch,
  } = useBatches();

  const {
    deleteBatch,
    isLoading:
      isDeleting,
  } = useDeleteBatch();
  const {
  activateBatch,
} = useActivateBatch();

const {
  deactivateBatch,
} = useDeactivateBatch();

const {
  restoreBatch,
} = useRestoreBatch();

  const [
    selectedBatchId,
    setSelectedBatchId,
  ] = useState("");

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false);

  const [filters, setFilters] =
    useState<{
      mode?: BatchMode;
      status?: BatchStatus;
      isActive?: boolean;
      includeDeleted: boolean;
    }>({
      mode: undefined,
      status: undefined,
      isActive: undefined,
      includeDeleted: false,
    });

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const {
    batch,
  } = useBatch(
    selectedBatchId,
  );

  const filteredBatches =
  useMemo(() => {
    if (!batches) return [];
    return batches.filter(
      (batch) => {
        if (
          filters.mode &&
          batch.mode !==
            filters.mode
        ) {
          return false;
        }

        if (
          filters.status &&
          batch.status !==
            filters.status
        ) {
          return false;
        }

        if (
          filters.isActive !==
            undefined &&
          batch.isActive !==
            filters.isActive
        ) {
          return false;
        }

        if (!filters.includeDeleted) {
  if (batch.isDeleted) {
    return false;
  }
}

        return true;
      },
    );
  }, [batches, filters]);

  const handleDelete =
    async () => {
      try {
        await deleteBatch(
          selectedBatchId,
        );

        appToast.success(
          "Batch deleted successfully",
        );

        setDeleteOpen(
          false,
        );

        await refetch();
      } catch {
        appToast.error(
          "Failed to delete batch",
        );
      }
    };

    const handleActivate = async (
  id: string,
) => {
  try {
    await activateBatch(id);

    appToast.success(
      "Batch activated successfully",
    );

    await refetch();
  } catch {
    appToast.error(
      "Failed to activate batch",
    );
  }
};

const handleDeactivate =
  async (id: string) => {
    try {
      await deactivateBatch(id);

      appToast.success(
        "Batch deactivated successfully",
      );

      await refetch();
    } catch {
      appToast.error(
        "Failed to deactivate batch",
      );
    }
  };

const handleRestore =
  async (id: string) => {
    try {
      await restoreBatch(id);

      appToast.success(
        "Batch restored successfully",
      );

      await refetch();
    } catch {
      appToast.error(
        "Failed to restore batch",
      );
    }
  };

  if (isLoading) {
    return (
      <BatchSkeleton />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Batches"
        description={
          error
        }
        onRetry={
          refetch
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Container to align PageHeader and Create button exactly to the right side */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <div className="flex items-center justify-between">
          <PageHeader
            title="Batches"
            description="Manage batches"
          />
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Create Batch
          </button>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl z-50 overflow-hidden outline-none">
            <div className="mb-3">
              <Dialog.Title className="text-base font-semibold text-slate-900">
                Create Batch
              </Dialog.Title>
            </div>
            <BatchForm 
              mode="create" 
              onSuccess={() => {
                setCreateOpen(false);
                void refetch();
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Modal Wrapper */}
      <Dialog.Root open={editOpen} onOpenChange={setEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl z-50 overflow-hidden outline-none">
            <div className="mb-3">
              <Dialog.Title className="text-base font-semibold text-slate-900">
                Edit Batch
              </Dialog.Title>
            </div>
            {batch && selectedBatchId && (
              <BatchForm 
                mode="edit" 
                batch={batch}
                onSuccess={() => {
                  setEditOpen(false);
                  void refetch();
                }}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <BatchFilters
        mode={filters.mode}
        status={filters.status}
        isActive={filters.isActive}
        includeDeleted={
          filters.includeDeleted
        }
        onModeChange={(value) =>
          setFilters({
            ...filters,
            mode:
              value === "ALL" || value === "ALL"
                ? undefined
                : (value as BatchMode),
          })
        }
        onStatusChange={(value) =>
          setFilters({
            ...filters,
            status:
              value === "ALL" || value === "ALL"
                ? undefined
                : (value as BatchStatus),
          })
        }
        onActiveChange={(value) =>
          setFilters({
            ...filters,
            isActive:
              value === "ALL" || value === "All"
                ? undefined
                : value === "true",
          })
        }
        onIncludeDeletedChange={(
          checked,
        ) =>
          setFilters({
            ...filters,
            includeDeleted: checked,
          })
        }
      />

      <Card>
        {filteredBatches.length ===
        0 ? (
          <EmptyBatch />
        ) : (
          <BatchTable
  batches={filteredBatches}
  onView={(id) => {
    setSelectedBatchId(id);
    setDetailsOpen(true);
  }}
  onEdit={(id) => {
    setSelectedBatchId(id);
    setEditOpen(true);
  }}
  onDelete={(id) => {
    setSelectedBatchId(id);
    setDeleteOpen(true);
  }}
  onActivate={handleActivate}
  onDeactivate={handleDeactivate}
  onRestore={handleRestore}
/>
        )}
      </Card>

      <Pagination
        page={1}
        totalPages={1}
        onPageChange={() => {}}
      />

      <BatchDeleteDialog
        open={
          deleteOpen
        }
        isLoading={
          isDeleting
        }
        onConfirm={
          handleDelete
        }
        onCancel={() =>
          setDeleteOpen(
            false,
          )
        }
      />

      <BatchDetailsDrawer
        open={
          detailsOpen
        }
        batch={batch}
        onClose={() =>
          setDetailsOpen(
            false,
          )
        }
      />
    </div>
  );
}