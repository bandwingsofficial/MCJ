"use client";

import type { ReactNode } from "react";
import { CalendarRange, Hash, type LucideIcon } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  IconValidatedField,
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import {
  batchIconInputClass,
  batchSelectTriggerClass,
} from "@/src/features/batches/utils/batch-form-field-styles";

import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type { BatchDurationType } from "@/src/features/batches/types/batch.types";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

function plainInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    extra,
  );
}

interface BaseProps {
  durationValue: number;
  durationType: BatchDurationType;
  onDurationValueChange: (value: number) => void;
  onDurationTypeChange: (value: BatchDurationType) => void;
  onDurationValueBlur?: () => void;
  valueState: FieldVisualState;
  typeState: FieldVisualState;
  idPrefix?: string;
}

type StandardDurationFieldProps = BaseProps & {
  layout?: "standard";
  valueErrorMessage?: string | null;
  typeErrorMessage?: string | null;
  errorMessage?: never;
};

type AssignDurationFieldProps = BaseProps & {
  layout: "assign";
  errorMessage?: string | null;
  valueErrorMessage?: never;
  typeErrorMessage?: never;
};

type Props = StandardDurationFieldProps | AssignDurationFieldProps;

/** Shared duration fields used by Batch and Assign Batches forms. */
export function BatchDurationField(props: Props) {
  const {
    durationValue,
    durationType,
    onDurationValueChange,
    onDurationTypeChange,
    onDurationValueBlur,
    valueState,
    typeState,
    idPrefix,
  } = props;

  if (props.layout === "assign") {
    const AssignDurationIcon = ({
      icon: Icon,
      children,
    }: {
      icon: LucideIcon;
      children: ReactNode;
    }) => (
      <div className="relative min-w-0">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#8AA0BB]"
          aria-hidden
        />
        {children}
      </div>
    );

    return (
      <ValidatedField
        label="Duration"
        required
        state={valueState}
        errorMessage={props.errorMessage ?? undefined}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2">
          <AssignDurationIcon icon={Hash}>
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
              className={plainInputClass(valueState, "pl-10")}
            />
          </AssignDurationIcon>
          <AssignDurationIcon icon={CalendarRange}>
            <AppSelect
              value={durationType}
              onValueChange={(value) =>
                onDurationTypeChange(value as BatchDurationType)
              }
              options={uniqueSelectOptions(BATCH_DURATION_TYPES)}
              triggerClassName={batchSelectTriggerClass(typeState)}
            />
          </AssignDurationIcon>
        </div>
      </ValidatedField>
    );
  }

  const valueErrorMessage = props.valueErrorMessage;
  const typeErrorMessage = props.typeErrorMessage;

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
