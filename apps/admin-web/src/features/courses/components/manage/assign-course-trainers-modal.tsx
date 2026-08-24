"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";

import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

function formatTrainerName(
  trainer: Pick<TrainerDetails, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

interface Props {
  open: boolean;
  assignedIds: string[];
  trainers: TrainerDetails[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (trainerIds: string[]) => Promise<void>;
}

export function AssignCourseTrainersModal({
  open,
  assignedIds,
  trainers,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIds([]);
    }
  }, [open]);

  const availableTrainers = useMemo(
    () => trainers.filter((trainer) => !assignedIds.includes(trainer.id)),
    [assignedIds, trainers],
  );

  const filteredTrainers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return availableTrainers;
    }

    return availableTrainers.filter((trainer) => {
      const haystack = [
        formatTrainerName(trainer),
        trainer.qualification ?? "",
        trainer.specialization ?? "",
        trainer.employeeCode ?? "",
        trainer.email ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [availableTrainers, search]);

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
    <Modal
      open={open}
      title="Assign Trainer"
      onClose={handleClose}
      contentClassName="min-w-0 max-w-2xl"
      bodyRef={bodyRef}
    >
      <div className="min-w-0 space-y-4">
        <SearchInput
          value={search}
          placeholder="Search trainers..."
          className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
          onChange={setSearch}
        />

        <div className="max-h-80 space-y-1 overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 p-2">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              Loading trainers...
            </p>
          ) : filteredTrainers.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              {availableTrainers.length === 0
                ? "All active trainers are already assigned to this course."
                : "No active trainers match your search."}
            </p>
          ) : (
            filteredTrainers.map((trainer) => {
              const checked = selectedIds.includes(trainer.id);
              const meta = [
                trainer.qualification?.trim() || null,
                trainer.specialization?.trim() || null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <label
                  key={trainer.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleTrainer(trainer.id)}
                  />

                  {trainer.profileImageUrl ? (
                    <Image
                      src={trainer.profileImageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {formatTrainerName(trainer).charAt(0) || "?"}
                    </div>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">
                      {formatTrainerName(trainer) || "—"}
                    </span>
                    {meta ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {meta}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
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
              disabled={isSubmitting || selectedIds.length === 0}
              onClick={async () => {
                await onAssign(selectedIds);
              }}
            >
              Assign Trainer{selectedIds.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
