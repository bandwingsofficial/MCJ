"use client";

import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type { BatchDurationType } from "@/src/features/batches/types/batch.types";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

function plainInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    extra,
  );
}

function selectTriggerClass(state: FieldVisualState) {
  return plainInputClass(state);
}

interface Props {
  durationValue: number;
  durationType: BatchDurationType;
  onDurationValueChange: (value: number) => void;
  onDurationTypeChange: (value: BatchDurationType) => void;
  onDurationValueBlur?: () => void;
  valueState: FieldVisualState;
  typeState: FieldVisualState;
  errorMessage?: string | null;
  idPrefix?: string;
}

/** Shared duration input used by Assign Batches and Edit Batch. */
export function BatchDurationField({
  durationValue,
  durationType,
  onDurationValueChange,
  onDurationTypeChange,
  onDurationValueBlur,
  valueState,
  typeState,
  errorMessage,
  idPrefix,
}: Props) {
  return (
    <ValidatedField
      label="Duration"
      required
      state={valueState}
      errorMessage={errorMessage ?? undefined}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2">
        <Input
          id={idPrefix ? `${idPrefix}-duration-value` : undefined}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          placeholder="2"
          autoComplete="off"
          value={Number.isFinite(durationValue) ? durationValue : ""}
          onChange={(event) => {
            const parsed =
              event.target.value === "" ? NaN : Number(event.target.value);
            onDurationValueChange(parsed);
          }}
          onBlur={onDurationValueBlur}
          className={plainInputClass(valueState)}
        />
        <AppSelect
          value={durationType}
          onValueChange={(value) =>
            onDurationTypeChange(value as BatchDurationType)
          }
          options={uniqueSelectOptions(BATCH_DURATION_TYPES)}
          triggerClassName={selectTriggerClass(typeState)}
        />
      </div>
    </ValidatedField>
  );
}
