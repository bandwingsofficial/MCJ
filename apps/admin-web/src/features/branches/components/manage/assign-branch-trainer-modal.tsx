"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { cn } from "@/src/shared/lib/cn";

import { formatTrainerDisplayName } from "@/src/features/branches/utils/branch-trainer-relation.utils";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

interface Props {
  open: boolean;
  branchId: string;
  trainers: TrainerListItem[];
  assignedTrainerIds: string[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (trainerIds: string[]) => Promise<void>;
}

export function AssignBranchTrainerModal({
  open,
  branchId,
  trainers,
  assignedTrainerIds,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const assignedIds = useMemo(
    () => new Set(assignedTrainerIds),
    [assignedTrainerIds],
  );

  const trainerById = useMemo(
    () => new Map(trainers.map((trainer) => [trainer.id, trainer])),
    [trainers],
  );

  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return trainers;
    }

    return trainers.filter((trainer) => {
      const haystack = [
        formatTrainerDisplayName(trainer),
        trainer.qualification ?? "",
        trainer.specialization ?? "",
        trainer.employeeCode ?? "",
        trainer.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, trainers]);

  const selectedTrainers = useMemo(
    () =>
      selectedIds
        .filter((id) => !assignedIds.has(id))
        .map((id) => trainerById.get(id))
        .filter((trainer): trainer is TrainerListItem => Boolean(trainer)),
    [assignedIds, selectedIds, trainerById],
  );

  const assignableSelectedCount = useMemo(
    () => selectedIds.filter((id) => !assignedIds.has(id)).length,
    [assignedIds, selectedIds],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearch("");
    setValidationError(null);
    setSelectedIds([]);
  }, [open]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => !assignedIds.has(id)));
  }, [assignedIds]);

  const toggleTrainer = (trainerId: string) => {
    if (assignedIds.has(trainerId)) {
      return;
    }

    setSelectedIds((current) => {
      if (current.includes(trainerId)) {
        return current.filter((id) => id !== trainerId);
      }

      return Array.from(new Set([...current, trainerId]));
    });
    setValidationError(null);
  };

  const removeSelectedTrainer = (trainerId: string) => {
    setSelectedIds((current) => current.filter((id) => id !== trainerId));
    setValidationError(null);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleAssign = async () => {
    if (!branchId) {
      return;
    }

    const assignableIds = selectedIds.filter((id) => !assignedIds.has(id));

    if (assignableIds.length === 0) {
      setValidationError("Select at least one trainer to assign.");
      return;
    }

    setValidationError(null);
    await onAssign(Array.from(new Set(assignableIds)));
  };

  return (
    <Modal
      open={open}
      title="Assign Trainer"
      onClose={handleClose}
      contentClassName="min-w-0 max-w-2xl"
      bodyRef={bodyRef}
    >
      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#102A56]">Select Trainer</p>
          <SearchInput
            value={search}
            placeholder="Search trainers..."
            className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
            onChange={setSearch}
          />
        </div>

        <div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              Loading trainers...
            </p>
          ) : filteredTrainers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              {trainers.length === 0
                ? "No active trainers are available."
                : "No active trainers match your search."}
            </p>
          ) : (
            filteredTrainers.map((trainer) => {
              const isAssigned = assignedIds.has(trainer.id);
              const isSelected = !isAssigned && selectedIds.includes(trainer.id);
              const displayName =
                formatTrainerDisplayName(trainer) || "Unnamed trainer";
              const meta = [
                trainer.qualification?.trim() || null,
                trainer.specialization?.trim() || null,
              ]
                .filter(Boolean)
                .join(" · ");

              const rowClassName = cn(
                "flex items-start gap-3 rounded-lg px-2 py-2",
                isAssigned
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "cursor-pointer hover:bg-slate-50",
              );

              const rowContent = (
                <>
                  <Checkbox
                    checked={isSelected}
                    disabled={isAssigned || isSubmitting}
                    onCheckedChange={() => toggleTrainer(trainer.id)}
                  />

                  {trainer.profileImageUrl ? (
                    <Image
                      src={trainer.profileImageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover",
                        isAssigned && "opacity-60",
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600",
                        isAssigned && "opacity-60",
                      )}
                    >
                      {displayName.charAt(0) || "?"}
                    </div>
                  )}

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-medium",
                        isAssigned ? "text-slate-500" : "text-[#102A56]",
                      )}
                    >
                      {displayName}
                    </span>
                    {meta ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {meta}
                      </span>
                    ) : null}
                    {isAssigned ? (
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {ALREADY_ASSIGNED_LABEL}
                      </span>
                    ) : null}
                  </span>
                </>
              );

              return isAssigned ? (
                <div
                  key={trainer.id}
                  aria-disabled="true"
                  className={rowClassName}
                >
                  {rowContent}
                </div>
              ) : (
                <label key={trainer.id} className={rowClassName}>
                  {rowContent}
                </label>
              );
            })
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[#102A56]">Selected Trainers</p>
          {selectedTrainers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#647A9B]">
              No trainers selected yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedTrainers.map((trainer) => {
                const displayName =
                  formatTrainerDisplayName(trainer) || "Unnamed trainer";

                return (
                  <span
                    key={trainer.id}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#DCE8F5] bg-[#F8FBFF] px-3 py-1 text-sm text-[#102A56]"
                  >
                    <span className="truncate">{displayName}</span>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      aria-label={`Remove ${displayName}`}
                      className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
                      onClick={() => removeSelectedTrainer(trainer.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {validationError ? (
            <p role="alert" className="text-sm text-red-500">
              {validationError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#647A9B]">
            {assignableSelectedCount} selected
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting || assignableSelectedCount === 0}
              onClick={() => {
                void handleAssign();
              }}
            >
              Assign Trainer{assignableSelectedCount === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
