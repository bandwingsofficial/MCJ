"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";

import { TrainerStatusBadge } from "./trainer-status-badge";
import { TrainerActions } from "./trainer-actions";

interface Props {
  trainers: TrainerListItem[];
  selectedTrainerIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyMessage?: string;
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
  emptyMessage = "No trainers found.",
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onReorder,
}: Props) {
  const [rows, setRows] = useState(trainers);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedTrainerIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((trainer) => trainer.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 8 : 7;

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
        safeSelectedIds.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds])),
    );
  };

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
    reorderDisabled || isSavingOrder || safeSelectedIds.length > 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <tr>
            {selectionEnabled ? (
              <th className="w-11 px-3 py-3 text-left">
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
              </th>
            ) : null}

            <th className="w-10 px-2 py-3">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Profile
            </th>
            <th className="min-w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Trainer Name
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Qualification
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Specialization
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="w-[7.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-3 py-12 text-center align-middle"
              >
                <p className="text-sm font-medium text-slate-900">
                  {emptyMessage}
                </p>
              </td>
            </tr>
          ) : (
            rows.map((trainer) => {
              const draggable = canReorder(trainer) && !dragDisabled;
              const isArchived = isArchivedTrainer(trainer);
              const fullName = [trainer.firstName, trainer.lastName]
                .filter(Boolean)
                .join(" ");
              const displayStatus = getTrainerDisplayStatus(trainer);

              return (
                <tr
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
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dropTargetId === trainer.id ? "bg-blue-50/60" : ""
                  } ${dragId === trainer.id ? "opacity-60" : ""} ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-11 px-3 py-3 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(trainer.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(trainer.id, Boolean(checked));
                        }}
                      />
                    </td>
                  ) : null}

                  <td className="w-10 px-2 py-3 align-middle">
                    {draggable ? (
                      <GripVertical className="h-4 w-4 cursor-grab text-slate-400 active:cursor-grabbing" />
                    ) : (
                      <span className="inline-block w-4" />
                    )}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    {trainer.profileImageUrl ? (
                      <Image
                        src={trainer.profileImageUrl}
                        alt={fullName}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-lg border border-slate-200 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <p className="font-medium text-slate-900">{fullName}</p>
                    {trainer.employeeCode ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {trainer.employeeCode}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-3 py-3 align-middle text-slate-700">
                    {trainer.qualification?.trim() || "—"}
                  </td>

                  <td className="px-3 py-3 align-middle text-slate-700">
                    {trainer.specialization?.trim() || "—"}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <TrainerStatusBadge status={displayStatus} />
                  </td>

                  <td className="px-2 py-3 align-middle">
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
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
