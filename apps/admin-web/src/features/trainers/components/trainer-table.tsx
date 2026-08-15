"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

import { TrainerStatusBadge } from "./trainer-status-badge";
import { TrainerActions } from "./trainer-actions";

interface TrainerTableProps {
  trainers: TrainerListItem[];
  selectedTrainerIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit: (trainer: TrainerListItem) => void;
  onActivate: (trainer: TrainerListItem) => void;
  onDeactivate: (trainer: TrainerListItem) => void;
  onDelete: (trainer: TrainerListItem) => void;
  onRestore: (trainer: TrainerListItem) => void;
  onPermanentDelete: (trainer: TrainerListItem) => void;
  onReorder: (payload: {
    trainerId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
}

function canReorder(trainer: TrainerListItem): boolean {
  return (
    !isArchivedTrainer(trainer) &&
    trainer.status === "ACTIVE" &&
    trainer.displayOrder != null
  );
}

export function TrainerTable({
  trainers,
  selectedTrainerIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  emptyTitle = "No Trainers Found",
  emptyDescription = "Create your first trainer to get started.",
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onReorder,
}: TrainerTableProps) {
  const [rows, setRows] = useState(trainers);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<
    string | null
  >(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedTrainerIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((trainer) => trainer.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id)
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 &&
    selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setRows(trainers);
  }, [trainers]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (trainerId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, trainerId]))
      : safeSelectedIds.filter((id) => id !== trainerId);

    onSelectionChange(next);
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    if (!checked) {
      onSelectionChange(
        safeSelectedIds.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds]))
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const handleDrop = async (targetId: string) => {
    if (
      !dragId ||
      dragId === targetId ||
      isSavingOrder ||
      reorderDisabled ||
      safeSelectedIds.length > 0
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previous = rows;
    const next = [...rows];
    const fromIndex = next.findIndex((item) => item.id === dragId);
    const toIndex = next.findIndex((item) => item.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const source = next[fromIndex];
    const target = next[toIndex];

    if (
      !canReorder(source) ||
      !canReorder(target) ||
      target.displayOrder == null
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const newDisplayOrder = target.displayOrder;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRows(next);

    try {
      setIsSavingOrder(true);
      await onReorder({
        trainerId: source.id,
        newDisplayOrder,
      });
    } catch {
      setRows(previous);
    } finally {
      setIsSavingOrder(false);
      setDragId(null);
      setDropTargetId(null);
    }
  };

  const dragDisabled =
    reorderDisabled ||
    isSavingOrder ||
    safeSelectedIds.length > 0;

  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={allVisibleSelected}
                disabled={selectionDisabled}
                onChange={(event) => {
                  toggleAllVisible(event.target.checked);
                }}
                aria-label="Select all trainers on this page"
              />
            </TableHead>
          ) : null}

          <TableHead className="w-10">
            <span className="sr-only">Reorder</span>
          </TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Trainer</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Specialization</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((trainer) => {
          const draggable =
            canReorder(trainer) && !dragDisabled;
          const fullName = [trainer.firstName, trainer.lastName]
            .filter(Boolean)
            .join(" ");

          return (
            <TableRow
              key={trainer.id}
              draggable={draggable}
              onDragStart={() => {
                if (!draggable) {
                  return;
                }
                setDragId(trainer.id);
              }}
              onDragOver={(event) => {
                if (!draggable || !dragId) {
                  return;
                }
                event.preventDefault();
                setDropTargetId(trainer.id);
              }}
              onDragLeave={() => {
                if (dropTargetId === trainer.id) {
                  setDropTargetId(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(trainer.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDropTargetId(null);
              }}
              className={`${
                dropTargetId === trainer.id ? "bg-slate-50" : ""
              } ${dragId === trainer.id ? "opacity-60" : ""}`}
            >
              {selectionEnabled ? (
                <TableCell className="w-10">
                  <Checkbox
                    checked={safeSelectedIds.includes(trainer.id)}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) => {
                      toggleRow(trainer.id, checked);
                    }}
                  />
                </TableCell>
              ) : null}

              <TableCell className="w-10">
                {draggable ? (
                  <GripVertical
                    className="h-3.5 w-3.5 cursor-grab text-slate-400"
                    aria-label="Drag to reorder"
                  />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
              </TableCell>

              <TableCell>
                {trainer.profileImageUrl ? (
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border bg-white">
                    <Image
                      src={trainer.profileImageUrl}
                      alt={fullName}
                      width={48}
                      height={48}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-slate-50 text-[11px] text-slate-400">
                    No Image
                  </div>
                )}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                <div>{fullName}</div>
                <div className="text-xs font-normal text-slate-500">
                  {trainer.employeeCode ?? "—"}
                </div>
              </TableCell>

              <TableCell>{trainer.phone ?? "—"}</TableCell>

              <TableCell>
                {trainer.trainerType.replaceAll("_", " ")}
              </TableCell>

              <TableCell>
                {trainer.specialization?.trim()
                  ? trainer.specialization
                  : "—"}
              </TableCell>

              <TableCell>
                <TrainerStatusBadge
                  status={trainer.status}
                  deletedAt={trainer.deletedAt}
                  isDeleted={trainer.isDeleted}
                />
              </TableCell>

              <TableCell className="text-right">
                <TrainerActions
                  trainer={trainer}
                  disabled={actionsDisabled || isSavingOrder}
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={onPermanentDelete}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
