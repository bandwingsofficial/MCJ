"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

function formatTrainerName(trainer: Pick<TrainerListItem, "firstName" | "lastName">) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

function formatTrainerMeta(trainer: TrainerListItem) {
  const parts = [
    trainer.employeeCode?.trim() || null,
    trainer.specialization?.trim() || null,
  ].filter(Boolean);

  return parts.join(" · ");
}

interface Props {
  open: boolean;
  assignedIds: string[];
  trainers: TrainerListItem[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (trainerIds: string[]) => Promise<void>;
}

export function AssignBatchTrainersModal({
  open,
  assignedIds,
  trainers,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIds(assignedIds);
    }
  }, [open, assignedIds]);

  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return trainers;
    }

    return trainers.filter((trainer) => {
      const haystack = [
        formatTrainerName(trainer),
        trainer.employeeCode ?? "",
        trainer.specialization ?? "",
        trainer.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, trainers]);

  const hasChanges = useMemo(() => {
    const current = [...selectedIds].sort();
    const assigned = [...assignedIds].sort();

    if (current.length !== assigned.length) {
      return true;
    }

    return current.some((id, index) => id !== assigned[index]);
  }, [assignedIds, selectedIds]);

  const toggleTrainer = (trainerId: string) => {
    setSelectedIds((current) =>
      current.includes(trainerId)
        ? current.filter((id) => id !== trainerId)
        : [...current, trainerId],
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <Modal open={open} title="Assign Trainer" onClose={handleClose}>
      <div className="space-y-4">
        <SearchInput
          value={search}
          placeholder="Search trainers..."
          onChange={setSearch}
        />

        <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              Loading trainers...
            </p>
          ) : filteredTrainers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              No active trainers match your search.
            </p>
          ) : (
            filteredTrainers.map((trainer) => {
              const checked = selectedIds.includes(trainer.id);
              const meta = formatTrainerMeta(trainer);

              return (
                <label
                  key={trainer.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleTrainer(trainer.id)}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[#102A56]">
                      {formatTrainerName(trainer) || "—"}
                    </span>
                    {meta ? (
                      <span className="block text-xs text-slate-500">{meta}</span>
                    ) : null}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-[#647A9B]">
            {selectedIds.length} selected
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
              disabled={
                isSubmitting || selectedIds.length === 0 || !hasChanges
              }
              onClick={async () => {
                await onAssign(selectedIds);
              }}
            >
              Assign
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
