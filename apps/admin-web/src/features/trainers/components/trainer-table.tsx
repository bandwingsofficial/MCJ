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
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {selectionEnabled ? (
              <th className="w-9 !px-6 !py-4 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all trainers on this page"
                />
              </th>
            ) : null}

            <th className="w-8 !px-4 !py-4">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="w-12 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Profile
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Trainer Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Qualification
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Specialization
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="!px-4 !py-12 text-center align-middle"
              >
                <p className="text-sm font-medium text-[#102A56]">
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
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(trainer.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(trainer.id, Boolean(checked));
                        }}
                      />
                    </td>
                  ) : null}

                  <td className="w-8 !px-4 !py-4 align-middle">
                    {draggable ? (
                      <GripVertical className="h-3.5 w-3.5 cursor-grab text-slate-400 active:cursor-grabbing" />
                    ) : (
                      <span className="inline-block w-3.5" />
                    )}
                  </td>

                  <td className="w-12 !px-4 !py-4 align-middle">
                    {trainer.profileImageUrl ? (
                      <Image
                        src={trainer.profileImageUrl}
                        alt={fullName}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-md border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                        N/A
                      </div>
                    )}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-medium leading-snug text-[#102A56]">
                      {fullName}
                    </p>
                    {trainer.employeeCode ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {trainer.employeeCode}
                      </p>
                    ) : null}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {trainer.qualification?.trim() || "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {trainer.specialization?.trim() || "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <TrainerStatusBadge status={displayStatus} />
                  </td>

                  <td className="!px-8 !py-4 align-middle">
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
