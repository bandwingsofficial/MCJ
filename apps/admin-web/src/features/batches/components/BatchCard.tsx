"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { Batch } from "@/src/features/batches/types/batch.types";

import { BatchModeBadge } from "./BatchModeBadge";
import { BatchStatusBadge } from "./BatchStatusBadge";

interface BatchCardProps {
  batch: Batch;

  onView: (id: string) => void;

  onEdit: (id: string) => void;

  onDelete: (id: string) => void;
}

export function BatchCard({
  batch,
  onView,
  onEdit,
  onDelete,
}: BatchCardProps) {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold">
            {batch.name}
          </h3>

          <p className="text-sm text-muted-foreground">
            {batch.code}
          </p>
        </div>

        <Dropdown
          trigger={
            <Button
              variant="outline"
              size="sm"
            >
              Actions
            </Button>
          }
          items={[
            {
              label: "View",
              onClick: () =>
                onView(batch.id),
            },
            {
              label: "Edit",
              onClick: () =>
                onEdit(batch.id),
            },
            {
              label: "Delete",
              onClick: () =>
                onDelete(batch.id),
            },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">
            Course
          </p>

          <p className="font-medium">
            {batch.course?.title ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">
            Branch
          </p>

          <p className="font-medium">
            {batch.branch?.branchName ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">
            Capacity
          </p>

          <p className="font-medium">
            {batch.enrolledCount} / {batch.capacity}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">
            Schedule
          </p>

          <p className="font-medium">
            {batch.startTime} - {batch.endTime}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <BatchModeBadge
          mode={batch.mode}
        />

        <BatchStatusBadge
          status={batch.status}
        />

        {batch.isFeatured && (
          <Badge variant="warning">
            Featured
          </Badge>
        )}
      </div>
    </Card>
  );
}