"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Button } from "@/src/shared/components/ui/button";
import { CreateBatchModal } from "@/src/features/batches/components/create-batch-modal";

export function BatchCreatePage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title="Create Batch"
          description="Create a new batch"
        />
        <Button size="sm" className="h-9" onClick={() => setIsOpen(true)}>
          Create New Batch
        </Button>
      </div>

      <CreateBatchModal
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          router.push("/batches");
        }}
        onSuccess={() => {
          router.push("/batches");
        }}
      />
    </div>
  );
}
