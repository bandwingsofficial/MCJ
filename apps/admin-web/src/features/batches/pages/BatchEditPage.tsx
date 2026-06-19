"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Button } from "@/src/shared/components/ui/button";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { useBatch } from "@/src/features/batches/hooks/useBatch";

interface BatchEditPageProps {
  batchId: string;
}

export function BatchEditPage({
  batchId,
}: BatchEditPageProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    batch,
    isLoading,
    error,
    refetch,
  } = useBatch(batchId);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !batch) {
    return (
      <ErrorState
        title="Failed to load batch"
        description={
          error ??
          "Batch not found"
        }
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Edit Batch"
          description="Update batch details"
        />
        
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <Button size="sm" className="h-9">
              Edit Batch Details
            </Button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            {/* Background Overlay */}
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />

            {/* Modal Box Container */}
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl z-50 overflow-hidden outline-none">
              <div className="mb-3">
                <Dialog.Title className="text-base font-semibold text-slate-900">
                  Edit Batch
                </Dialog.Title>
              </div>

              {/* Form Content */}
              <BatchForm
                mode="edit"
                batch={batch}
                onSuccess={() => setIsOpen(false)}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}