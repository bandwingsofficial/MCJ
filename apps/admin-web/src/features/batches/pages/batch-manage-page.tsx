"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useBatchSummary } from "@/src/features/batches/hooks/useBatchSummary";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { useRestoreBatch } from "@/src/features/batches/hooks/useRestoreBatch";
import { batchService } from "@/src/features/batches/services/batch.service";

import { BatchDeleteDialog } from "@/src/features/batches/components/BatchDeleteDialog";
import { PermanentDeleteBatchDialog } from "@/src/features/batches/components/permanent-delete-batch-dialog";
import { UpdateBatchModal } from "@/src/features/batches/components/update-batch-modal";
import { BatchManageHeader } from "@/src/features/batches/components/manage/batch-manage-header";
import {
  BATCH_MANAGE_TABS,
  BatchManageWorkspace,
  type BatchManageTabKey,
} from "@/src/features/batches/components/manage/batch-manage-workspace";
import { BATCH_MANAGE_DEFAULT_TAB } from "@/src/features/batches/utils/batch-manage.routes";

interface Props {
  batchId: string;
}

const TAB_LABELS = Object.fromEntries(
  BATCH_MANAGE_TABS.map(({ value, label }) => [value, label]),
) as Record<BatchManageTabKey, string>;

export function BatchManagePage({ batchId }: Props) {
  const router = useRouter();
  const { batch, isLoading, error, refetch } = useBatch(batchId);
  const {
    summary,
    isLoading: summaryLoading,
  } = useBatchSummary(batchId);

  const { deleteBatch, isLoading: isArchiving } = useDeleteBatch();
  const { restoreBatch, isLoading: isRestoring } = useRestoreBatch();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    TAB_LABELS[BATCH_MANAGE_DEFAULT_TAB],
  );

  const actionsDisabled =
    isArchiving || isRestoring || isPermanentDeleting;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !batch) {
    return (
      <ErrorState
        title="Batch Not Found"
        description={error ?? "Unable to load this batch."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="min-h-full min-w-0">
        <BatchManageHeader
          batch={batch}
          activeSection={activeSection}
          onArchive={() => setIsArchiveOpen(true)}
          onRestore={() => setIsRestoreOpen(true)}
          onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
          actionsDisabled={actionsDisabled}
        />

        <div className="mt-4">
          <BatchManageWorkspace
            batch={batch}
            summary={summary}
            summaryLoading={summaryLoading}
            onTabChange={(tab) => {
              setActiveSection(TAB_LABELS[tab]);
            }}
            onEditBatch={() => setIsEditOpen(true)}
            editDisabled={actionsDisabled}
          />
        </div>
      </div>

      <UpdateBatchModal
        open={isEditOpen}
        batch={batch}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <BatchDeleteDialog
        open={isArchiveOpen}
        isLoading={isArchiving}
        onCancel={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          try {
            await deleteBatch(batch.id);
            appToast.success("Batch archived successfully");
            setIsArchiveOpen(false);
            router.push("/batches");
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={isRestoreOpen}
        title="Restore batch?"
        description={`Restore "${batch.name}" from archive?`}
        confirmLabel="Restore"
        loading={isRestoring}
        onCancel={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          try {
            await restoreBatch(batch.id);
            appToast.success("Batch restored successfully");
            setIsRestoreOpen(false);
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <PermanentDeleteBatchDialog
        open={isPermanentDeleteOpen}
        batchName={batch.name}
        isLoading={isPermanentDeleting}
        onCancel={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          try {
            setIsPermanentDeleting(true);
            await batchService.permanentlyDeleteBatch(batch.id);
            appToast.success("Batch permanently deleted");
            setIsPermanentDeleteOpen(false);
            router.push("/batches");
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsPermanentDeleting(false);
          }
        }}
      />
    </>
  );
}
