"use client";

import {
  useEffect,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CalendarDays,
  CalendarRange,
  Clock,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  IconValidatedField,
  iconDecorInputClass,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";
import {
  buildEntityFormSessionKey,
  useFormSessionReset,
} from "@/src/shared/hooks/use-form-session-reset";

import {
  DAYS_OF_WEEK,
  FILTER_BATCH_MODES,
} from "@/src/features/batches/constants/batch.constants";
import {
  batchTemplateSchema,
  type BatchTemplateFormValues,
} from "@/src/features/batch-templates/schemas/batch-template.schema";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";
import {
  DEFAULT_BATCH_TEMPLATE_FORM_VALUES,
  mapBatchTemplateToFormValues,
} from "@/src/features/batch-templates/utils/batch-template-form.utils";

const MODE_OPTIONS = FILTER_BATCH_MODES.map(({ label, value }) => ({
  label,
  value,
}));

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

type BatchTemplateFormProps = {
  initial?: BatchTemplate | null;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: BatchTemplateFormValues) => Promise<void> | void;
  onCancel: () => void;
};

function iconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

function selectTriggerClass(state: FieldVisualState) {
  return validatedFieldInputClass(state, "w-full min-w-0 max-w-full", {
    select: true,
    leftIcon: true,
  });
}

function IconField({
  label,
  required,
  state,
  errorMessage,
  icon,
  select,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string;
  icon: LucideIcon;
  select?: boolean;
  children: ReactNode;
}) {
  return (
    <IconValidatedField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      icon={icon}
      select={select}
    >
      {children}
    </IconValidatedField>
  );
}

function ScheduleTypeToggle({
  hasFixedTime,
  onSelectFixed,
  onSelectAnytime,
}: {
  hasFixedTime: boolean;
  onSelectFixed: () => void;
  onSelectAnytime: () => void;
}) {
  const buttonClass =
    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={cn(
          buttonClass,
          hasFixedTime
            ? "border-[#102A56] bg-[#102A56] text-white"
            : "border-slate-200 bg-white text-slate-700",
        )}
        onClick={onSelectFixed}
      >
        Fixed schedule
      </button>
      <button
        type="button"
        className={cn(
          buttonClass,
          !hasFixedTime
            ? "border-[#102A56] bg-[#102A56] text-white"
            : "border-slate-200 bg-white text-slate-700",
        )}
        onClick={onSelectAnytime}
      >
        Anytime / No fixed time
      </button>
    </div>
  );
}

export function BatchTemplateForm({
  initial,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: BatchTemplateFormProps) {
  const mergedDefaults = initial
    ? mapBatchTemplateToFormValues(initial)
    : DEFAULT_BATCH_TEMPLATE_FORM_VALUES;

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<BatchTemplateFormValues>({
    resolver: zodResolver(batchTemplateSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: mergedDefaults,
  });

  useFormSessionReset(
    reset,
    initial ? buildEntityFormSessionKey(initial) : "create",
    mergedDefaults,
  );

  const hasFixedTime = watch("hasFixedTime");
  const daysOfWeek = watch("daysOfWeek");
  const selectedMode = watch("mode");

  const getFieldState = (
    name: keyof BatchTemplateFormValues,
  ): FieldVisualState => {
    const interacted =
      Boolean(touchedFields[name]) ||
      Boolean(dirtyFields[name]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    return "valid";
  };

  const registerField = (name: "name" | "startTime" | "endTime") => {
    const registration = register(name);

    return {
      ...registration,
      className: iconInputClass(getFieldState(name)),
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        registration.onBlur(event);
        void trigger(name);
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        registration.onChange(event);
        void trigger(name);
      },
    };
  };

  const toggleDay = (day: BatchTemplateFormValues["daysOfWeek"][number]) => {
    const next = daysOfWeek.includes(day)
      ? daysOfWeek.filter((item) => item !== day)
      : [...daysOfWeek, day];

    setValue("daysOfWeek", next, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleModeChange = (value: BatchTemplateFormValues["mode"]) => {
    setValue("mode", value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    if (value === "RECORDED") {
      setValue("hasFixedTime", false, { shouldDirty: true });
      setValue("daysOfWeek", [], { shouldValidate: true });
      return;
    }

    if (!hasFixedTime) {
      setValue("hasFixedTime", true, { shouldDirty: true });
      setValue("daysOfWeek", DEFAULT_BATCH_TEMPLATE_FORM_VALUES.daysOfWeek, {
        shouldValidate: true,
      });
    }
  };

  const handleSelectAnytime = () => {
    setValue("hasFixedTime", false, { shouldDirty: true, shouldTouch: true });
    setValue("daysOfWeek", [], { shouldValidate: true });
  };

  useEffect(() => {
    if (hasFixedTime) {
      void trigger(["daysOfWeek", "startTime", "endTime"]);
    }
  }, [hasFixedTime, trigger]);

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          daysOfWeek: values.hasFixedTime ? values.daysOfWeek : [],
          startTime: values.hasFixedTime ? values.startTime : undefined,
          endTime: values.hasFixedTime ? values.endTime : undefined,
        });
      })}
    >
      <div className={`${GRID_CLASS} min-h-0 flex-1 overflow-y-auto`}>
        <IconField
          label="Batch Name"
          required
          icon={Tag}
          state={getFieldState("name")}
          errorMessage={errors.name?.message}
        >
          <Input
            placeholder="Morning Batch"
            autoComplete="off"
            {...registerField("name")}
          />
        </IconField>

        <IconField
          label="Capacity"
          required
          icon={Users}
          state={getFieldState("capacity")}
          errorMessage={errors.capacity?.message}
        >
          <Input
            type="number"
            min={1}
            step={1}
            placeholder="30"
            autoComplete="off"
            className={iconInputClass(getFieldState("capacity"))}
            {...register("capacity", {
              valueAsNumber: true,
              onBlur: () => {
                void trigger("capacity");
              },
              onChange: () => {
                void trigger("capacity");
              },
            })}
          />
        </IconField>

        <div className="md:col-span-2">
          <IconField
            label="Mode"
            required
            icon={BookOpen}
            select
            state={getFieldState("mode")}
            errorMessage={errors.mode?.message}
          >
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <AppSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleModeChange(value as BatchTemplateFormValues["mode"]);
                  }}
                  options={MODE_OPTIONS}
                  placeholder="Select mode"
                  triggerClassName={selectTriggerClass(getFieldState("mode"))}
                />
              )}
            />
          </IconField>
        </div>

        {selectedMode === "RECORDED" ? (
          <p className="md:col-span-2 text-xs text-[#647A9B]">
            Recorded batch timings use a self-paced schedule.
          </p>
        ) : null}

        <div className="md:col-span-2">
          <IconField
            label="Schedule Type"
            required
            icon={CalendarRange}
            state={getFieldState("hasFixedTime")}
          >
            <ScheduleTypeToggle
              hasFixedTime={hasFixedTime}
              onSelectFixed={() => {
                setValue("hasFixedTime", true, {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              onSelectAnytime={handleSelectAnytime}
            />
          </IconField>
        </div>

        {hasFixedTime ? (
          <>
            <div className="md:col-span-2">
              <IconField
                label="Batch Days"
                required
                icon={CalendarDays}
                state={getFieldState("daysOfWeek")}
                errorMessage={errors.daysOfWeek?.message}
              >
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {DAYS_OF_WEEK.map((day) => {
                    const selected = daysOfWeek.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        className={cn(
                          "rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                          selected
                            ? "border-[#102A56] bg-[#102A56] text-white"
                            : "border-slate-200 bg-white text-slate-600",
                        )}
                        onClick={() => toggleDay(day.value)}
                      >
                        {day.label.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </IconField>
            </div>

            <IconField
              label="Start Time"
              required
              icon={Clock}
              state={getFieldState("startTime")}
              errorMessage={errors.startTime?.message}
            >
              <Input type="time" autoComplete="off" {...registerField("startTime")} />
            </IconField>

            <IconField
              label="End Time"
              required
              icon={Clock}
              state={getFieldState("endTime")}
              errorMessage={errors.endTime?.message}
            >
              <Input type="time" autoComplete="off" {...registerField("endTime")} />
            </IconField>
          </>
        ) : null}
      </div>

      <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
