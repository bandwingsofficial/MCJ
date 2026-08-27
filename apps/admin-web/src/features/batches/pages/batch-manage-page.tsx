"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useBatchCourseAssignments } from "@/src/features/batches/hooks/useBatchCourseAssignments";
import { useBatchSummary } from "@/src/features/batches/hooks/useBatchSummary";
import { useDeleteBatch } from "@/src/features/batches/hooks/useDeleteBatch";
import { useRestoreBatch } from "@/src/features/batches/hooks/useRestoreBatch";
import { batchService } from "@/src/features/batches/services/batch.service";

import { BatchDeleteDialog } from "@/src/features/batches/components/BatchDeleteDialog";
import { PermanentDeleteBatchDialog } from "@/src/features/batches/components/permanent-delete-batch-dialog";
import { BatchManageHeader } from "@/src/features/batches/components/manage/batch-manage-header";
import { BatchManageWorkspace } from "@/src/features/batches/components/manage/batch-manage-workspace";
import type { BatchCourseAssignment } from "@/src/features/batches/types/batch.types";

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
  const {
    assignments: fetchedAssignments,
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useBatchCourseAssignments(batchId);
  const [assignments, setAssignments] = useState<BatchCourseAssignment[]>([]);

  useEffect(() => {
    setAssignments(
      fetchedAssignments.filter((item) => item.batchId === batchId),
    );
  }, [batchId, fetchedAssignments]);

  const { deleteBatch, isLoading: isArchiving } = useDeleteBatch();
  const { restoreBatch, isLoading: isRestoring } = useRestoreBatch();

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
      <div className="min-h-full min-w-0">
      <BatchManageHeader
        batch={batch}
        assignments={assignments}
        assignmentsLoading={assignmentsLoading}
        activeSection={activeSection}
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
          batchId={batchId}
          batch={batch}
          summary={summary}
          summaryLoading={summaryLoading}
          assignments={assignments}
          assignmentsLoading={assignmentsLoading}
          onAssignmentsChange={setAssignments}
          onSummaryRefresh={refetchSummary}
          onBatchUpdated={refetch}
          onAssignmentsRefresh={refetchAssignments}
          onTabChange={(tab) => {
            const labels: Record<string, string> = {
              overview: "Overview",
              courses: "Courses",
            };
            setActiveSection(labels[tab]);
          }}
        />
      </div>
      </div>

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
