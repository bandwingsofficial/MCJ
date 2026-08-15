"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { BatchManageWorkspace } from "@/src/features/batches/components/manage/batch-manage-workspace";

interface Props {
  batchId: string;
}

export function BatchManagePage({ batchId }: Props) {
  const router = useRouter();
  const { batch, isLoading, error, refetch } = useBatch(batchId);
  const {
    summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useBatchSummary(batchId);

  const { deleteBatch, isLoading: isArchiving } = useDeleteBatch();
  const { restoreBatch, isLoading: isRestoring } = useRestoreBatch();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>();

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
      <BatchManageHeader
        batch={batch}
        activeSection={activeSection}
        onEdit={() => setIsEditOpen(true)}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={async () => {
          try {
            await restoreBatch(batch.id);
            appToast.success("Batch restored successfully");
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
        actionsDisabled={actionsDisabled}
      />

      <div className="mt-4">
        <BatchManageWorkspace
          batch={batch}
          summary={summary}
          summaryLoading={summaryLoading}
          onSummaryRefresh={refetchSummary}
          onBatchUpdated={refetch}
          onTabChange={(tab) => {
            const labels: Record<string, string> = {
              overview: "Overview",
              students: "Students",
              trainers: "Trainers",
              schedule: "Schedule",
              attendance: "Attendance",
              reports: "Reports",
            };
            setActiveSection(labels[tab]);
          }}
        />
      </div>

      <UpdateBatchModal
        open={isEditOpen}
        batch={batch}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          appToast.success("Batch updated successfully");
          await refetch();
          await refetchSummary();
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
