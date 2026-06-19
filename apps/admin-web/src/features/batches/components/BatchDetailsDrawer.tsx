"use client";

import { Drawer } from "@/src/shared/components/ui/drawer";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchDetailsDrawerProps {
  open: boolean;

  batch: Batch | null;

  onClose: () => void;
}

export function BatchDetailsDrawer({
  open,
  batch,
  onClose,
}: BatchDetailsDrawerProps) {
  if (!batch) {
    return null;
  }

  return (
    <Drawer
      open={open}
      title="Batch Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        <Card>
          <div className="space-y-3">
            <div>
              <strong>Name:</strong>{" "}
              {batch.name}
            </div>

            <div>
              <strong>Code:</strong>{" "}
              {batch.code}
            </div>

            <div>
              <strong>Course:</strong>{" "}
              {batch.course?.title}
            </div>

            <div>
              <strong>Branch:</strong>{" "}
              {batch.branch?.branchName ??
                "-"}
            </div>

            <div>
              <strong>Capacity:</strong>{" "}
              {batch.capacity}
            </div>

            <div>
              <strong>Enrolled:</strong>{" "}
              {batch.enrolledCount}
            </div>

            <div>
              <strong>Mode:</strong>{" "}
              {batch.mode}
            </div>

            <div>
              <strong>Status:</strong>{" "}
              {batch.status}
            </div>
          </div>
        </Card>
      </div>
    </Drawer>
  );
}