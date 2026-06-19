"use client";

import { LucideMoreVertical } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

import { BatchModeBadge } from "./BatchModeBadge";
import { BatchStatusBadge } from "./BatchStatusBadge";

interface BatchTableProps {
  batches: Batch[];

  onView: (id: string) => void;

  onEdit: (id: string) => void;

  onDelete: (id: string) => void;

  onActivate: (id: string) => void;

  onDeactivate: (id: string) => void;

  onRestore: (id: string) => void;
}

export function BatchTable({
  batches,
  onView,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onRestore,
}: BatchTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Name
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Code
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Course
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Branch
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Mode
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Status
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider">
            Capacity
          </TableHead>

          <TableHead className="py-2 text-xs font-semibold uppercase tracking-wider w-[60px] text-center">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {batches.map(
          (batch) => (
            <TableRow
              key={
                batch.id
              }
            >
              <TableCell className="py-2 text-sm font-medium text-slate-900">
                {batch.name}
              </TableCell>

              <TableCell className="py-2 text-sm text-slate-600">
                {batch.code}
              </TableCell>

              <TableCell className="py-2 text-sm text-slate-600">
                {
                  batch
                    .course
                    ?.title
                }
              </TableCell>

              <TableCell className="py-2 text-sm text-slate-600">
                {batch
                  .branch
                  ?.branchName ??
                  "-"}
              </TableCell>

              <TableCell className="py-2">
                <BatchModeBadge
                  mode={
                    batch.mode
                  }
                />
              </TableCell>

              <TableCell className="py-2">
                <BatchStatusBadge
                  status={
                    batch.status
                  }
                />
              </TableCell>

              <TableCell className="py-2 text-sm text-slate-600">
                {batch.capacity}
              </TableCell>

              <TableCell className="py-2 text-center">
                <Dropdown
                  trigger={
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center h-8 w-8 p-0 rounded-full hover:bg-slate-100 mx-auto"
                    >
                      <LucideMoreVertical className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  }
                  items={[
  {
    label: "View",
    onClick: () =>
      onView(batch.id),
  },

  ...(batch.isDeleted
    ? [
        {
          label: "Restore",
          onClick: () =>
            onRestore(batch.id),
        },
      ]
    : [
        {
          label: "Edit",
          onClick: () =>
            onEdit(batch.id),
        },

        ...(batch.isActive
          ? [
              {
                label:
                  "Deactivate",
                onClick: () =>
                  onDeactivate(
                    batch.id,
                  ),
              },
            ]
          : [
              {
                label:
                  "Activate",
                onClick: () =>
                  onActivate(
                    batch.id,
                  ),
              },
            ]),

        {
          label:
            "Delete",
          onClick: () =>
            onDelete(
              batch.id,
            ),
        },
      ]),
]}
                />
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  );
}