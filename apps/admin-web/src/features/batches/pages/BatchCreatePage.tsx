"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Button } from "@/src/shared/components/ui/button";
import { BatchForm } from "@/src/features/batches/components/BatchForm";

export function BatchCreatePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PageHeader
          title="Create Batch"
          description="Create a new batch"
        />
        
        <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <Button size="sm" className="h-9">
              Create New Batch
            </Button>
          </Dialog.Trigger>
          
          <Dialog.Portal>
            {/* Background Overlay */}
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />

            {/* Modal Box Container */}
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-xl z-50 overflow-hidden outline-none">
              <div className="mb-3">
                <Dialog.Title className="text-base font-semibold text-slate-900">
                  Create Batch
                </Dialog.Title>
              </div>

              {/* Form Content */}
              <BatchForm 
                mode="create" 
                onSuccess={() => setIsOpen(false)}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}