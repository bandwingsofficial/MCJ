"use client";

import { CalendarRange, Hash } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { IconValidatedField, type FieldVisualState } from "@/src/shared/components/ui/validated-field";

import {
  batchIconInputClass,
  batchSelectTriggerClass,
} from "@/src/features/batches/utils/batch-form-field-styles";

import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type { BatchDurationType } from "@/src/features/batches/types/batch.types";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

interface Props {
  durationValue: number;
  durationType: BatchDurationType;
  onDurationValueChange: (value: number) => void;
  onDurationTypeChange: (value: BatchDurationType) => void;
  onDurationValueBlur?: () => void;
  valueState: FieldVisualState;
  typeState: FieldVisualState;
  valueErrorMessage?: string | null;
  typeErrorMessage?: string | null;
  idPrefix?: string;
}

/** Shared duration fields used by Batch create/edit forms. */
export function BatchDurationField({
  durationValue,
  durationType,
  onDurationValueChange,
  onDurationTypeChange,
  onDurationValueBlur,
  valueState,
  typeState,
  valueErrorMessage,
  typeErrorMessage,
  idPrefix,
}: Props) {
  return (
    <>
      <IconValidatedField
        label="Duration"
        required
        icon={Hash}
        state={valueState}
        errorMessage={valueErrorMessage ?? undefined}
      >
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
          className={batchIconInputClass(valueState)}
        />
      </IconValidatedField>

      <IconValidatedField
        label="Schedule Type"
        required
        icon={CalendarRange}
        select
        state={typeState}
        errorMessage={typeErrorMessage ?? undefined}
      >
        <AppSelect
          value={durationType}
          onValueChange={(value) =>
            onDurationTypeChange(value as BatchDurationType)
          }
          options={uniqueSelectOptions(BATCH_DURATION_TYPES)}
          triggerClassName={batchSelectTriggerClass(typeState)}
        />
      </IconValidatedField>
    </>
  );
}
