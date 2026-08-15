"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import type { CourseTrainerAssignment } from "@/src/features/courses/types/course.types";

interface Props {
  open: boolean;
  trainers: CourseTrainerAssignment[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (trainerIds: string[]) => Promise<void>;
}

function formatTrainerName(trainer: CourseTrainerAssignment) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
}

export function AssignCourseTrainersModal({
  open,
  trainers,
  isLoading = false,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setSubmitAttempted(false);
    }
  }, [open]);

  const selectedTrainers = useMemo(
    () => trainers.filter((trainer) => selected.includes(trainer.id)),
    [selected, trainers],
  );

  const selectionState: FieldVisualState = !submitAttempted
    ? "neutral"
    : selected.length > 0
      ? "valid"
      : "invalid";

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev, id],
    );
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (selected.length === 0) {
      return;
    }

    await onAssign(selected);
  };

  return (
    <Modal
      open={open}
      title="Assign Trainers"
      onClose={handleClose}
      contentClassName="min-w-0"
    >
      <div className="min-w-0 space-y-4 overflow-x-hidden">
        <p className="text-sm text-slate-600">
          Select one or more trainers to assign to this course.
        </p>

        <ValidatedField
          label="Trainer"
          required
          state={selectionState}
          errorMessage={
            submitAttempted && selected.length === 0
              ? "Please select at least one trainer."
              : null
          }
        >
          <div
            className={cn(
              "min-w-0 rounded-xl border bg-white",
              validatedFieldInputClass(selectionState),
              selectionState === "neutral" && "border-slate-300",
            )}
          >
            <div className="max-h-64 min-w-0 overflow-y-auto p-2">
              {isLoading ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  Loading active trainers...
                </p>
              ) : trainers.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  No active trainers available
                </p>
              ) : (
                trainers.map((trainer) => {
                  const checked = selected.includes(trainer.id);
                  const name = formatTrainerName(trainer);

                  return (
                    <label
                      key={trainer.id}
                      className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={checked}
                        disabled={isSubmitting}
                        onCheckedChange={() => toggle(trainer.id)}
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {name || "—"}
                        </span>
                        {trainer.employeeCode ? (
                          <span className="block text-xs text-slate-500">
                            {trainer.employeeCode}
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </ValidatedField>

        {selectedTrainers.length > 0 ? (
          <div className="space-y-2">
            <Label>Selected</Label>
            <div className="flex flex-wrap gap-2">
              {selectedTrainers.map((trainer) => (
                <span
                  key={trainer.id}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {formatTrainerName(trainer)}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={isSubmitting}
            disabled={isSubmitting || isLoading || trainers.length === 0}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? "Assigning..." : "Assign Trainers"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
