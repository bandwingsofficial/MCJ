"use client";

import { useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { UpdateBatchModal } from "@/src/features/batches/components/update-batch-modal";
import { useBatch } from "@/src/features/batches/hooks/useBatch";

interface BatchEditPageProps {
  batchId: string;
}

export function BatchEditPage({ batchId }: BatchEditPageProps) {
  const router = useRouter();
  const { batch, isLoading, error, refetch } = useBatch(batchId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !batch) {
    return (
      <ErrorState
        title="Failed to load batch"
        description={error ?? "Batch not found"}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <UpdateBatchModal
      open
      batch={batch}
      onClose={() => router.push("/batches")}
      onSuccess={() => router.push(`/batches/${batch.id}/manage`)}
    />
  );
}
