"use client";

import { useEffect, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";
import { cn } from "@/src/shared/lib/cn";

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

const EDIT_GRID_CLASS = "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2";

type BatchTemplateFormProps = {
  initial?: BatchTemplate | null;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: BatchTemplateFormValues) => Promise<void> | void;
  onCancel: () => void;
};

function FormSection({
  title,
  description,
  children,
  contentClassName,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-2.5">
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[#647A9B]">{description}</p>
        ) : null}
      </header>
      <div className={cn(EDIT_GRID_CLASS, "p-4", contentClassName)}>
        {children}
      </div>
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs text-red-600">{message}</p>;
}

function ScheduleTypeToggle({
  hasFixedTime,
  onSelectFixed,
  onSelectAnytime,
  compact = false,
}: {
  hasFixedTime: boolean;
  onSelectFixed: () => void;
  onSelectAnytime: () => void;
  compact?: boolean;
}) {
  const buttonClass = compact
    ? "rounded-lg border px-2.5 py-1.5 text-xs font-medium"
    : "rounded-lg border px-3 py-2 text-sm";

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

function BatchDaysField({
  daysOfWeek,
  onToggleDay,
  error,
  compact = false,
}: {
  daysOfWeek: BatchTemplateFormValues["daysOfWeek"];
  onToggleDay: (day: BatchTemplateFormValues["daysOfWeek"][number]) => void;
  error?: string;
  compact?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>Batch Days</Label>
      <div className="flex flex-wrap gap-1.5">
        {DAYS_OF_WEEK.map((day) => {
          const selected = daysOfWeek.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              className={cn(
                "rounded-lg border font-medium",
                compact ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs",
                selected
                  ? "border-[#102A56] bg-[#102A56] text-white"
                  : "border-slate-200 bg-white text-slate-600",
              )}
              onClick={() => onToggleDay(day.value)}
            >
              {day.label.slice(0, 3)}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function TimeFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<BatchTemplateFormValues>>["register"];
  errors: ReturnType<
    typeof useForm<BatchTemplateFormValues>
  >["formState"]["errors"];
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="start-time">Start Time</Label>
        <Input id="start-time" type="time" {...register("startTime")} />
        <FieldError message={errors.startTime?.message} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="end-time">End Time</Label>
        <Input id="end-time" type="time" {...register("endTime")} />
        <FieldError message={errors.endTime?.message} />
      </div>
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
  const isEdit = Boolean(initial);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BatchTemplateFormValues>({
    resolver: zodResolver(batchTemplateSchema),
    defaultValues: initial
      ? mapBatchTemplateToFormValues(initial)
      : DEFAULT_BATCH_TEMPLATE_FORM_VALUES,
  });

  useEffect(() => {
    if (initial) {
      reset(mapBatchTemplateToFormValues(initial));
      return;
    }

    reset(DEFAULT_BATCH_TEMPLATE_FORM_VALUES);
  }, [initial, reset]);

  const hasFixedTime = watch("hasFixedTime");
  const daysOfWeek = watch("daysOfWeek");
  const selectedMode = watch("mode");

  const toggleDay = (day: BatchTemplateFormValues["daysOfWeek"][number]) => {
    const next = daysOfWeek.includes(day)
      ? daysOfWeek.filter((item) => item !== day)
      : [...daysOfWeek, day];
    setValue("daysOfWeek", next, { shouldValidate: true });
  };

  const handleModeChange = (value: BatchTemplateFormValues["mode"]) => {
    setValue("mode", value, { shouldValidate: true });

    if (value === "RECORDED") {
      setValue("hasFixedTime", false);
      setValue("daysOfWeek", []);
      return;
    }

    if (!hasFixedTime) {
      setValue("hasFixedTime", true);
      setValue("daysOfWeek", [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ]);
    }
  };

  const handleSelectAnytime = () => {
    setValue("hasFixedTime", false);
    setValue("daysOfWeek", []);
  };

  const formFooter = (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </div>
  );

  const modeField = (
    <div className={cn("space-y-1.5", isEdit && "sm:col-span-2")}>
      <Label>Mode</Label>
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
            {...(field.value ? {} : { placeholder: "Select mode" })}
          />
        )}
      />
    </div>
  );

  const scheduleTypeField = (
    <div className={cn("space-y-2", isEdit && "sm:col-span-2")}>
      <Label>Schedule Type</Label>
      <ScheduleTypeToggle
        hasFixedTime={hasFixedTime}
        compact={isEdit}
        onSelectFixed={() => setValue("hasFixedTime", true)}
        onSelectAnytime={handleSelectAnytime}
      />
    </div>
  );

  const fixedScheduleFields = hasFixedTime ? (
    <>
      <div className={cn(isEdit && "sm:col-span-2")}>
        <BatchDaysField
          daysOfWeek={daysOfWeek}
          onToggleDay={toggleDay}
          error={errors.daysOfWeek?.message}
          compact={isEdit}
        />
      </div>
      <div className={cn(isEdit && "sm:col-span-2")}>
        <TimeFields register={register} errors={errors} />
      </div>
    </>
  ) : null;

  if (isEdit) {
    return (
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            daysOfWeek: values.hasFixedTime ? values.daysOfWeek : [],
            startTime: values.hasFixedTime ? values.startTime : undefined,
            endTime: values.hasFixedTime ? values.endTime : undefined,
          });
        })}
      >
        <FormSection
          title="Basic details"
          description="Batch name and seat capacity"
        >
          <div className="space-y-1.5">
            <Label htmlFor="template-name">Batch Name</Label>
            <Input
              id="template-name"
              placeholder="Morning Batch"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-capacity">Capacity</Label>
            <Input
              id="template-capacity"
              type="number"
              min={1}
              step={1}
              placeholder="30"
              {...register("capacity", { valueAsNumber: true })}
            />
            <FieldError message={errors.capacity?.message} />
          </div>
        </FormSection>

        <FormSection title="Delivery mode">
          {modeField}
          {selectedMode === "RECORDED" ? (
            <p className="sm:col-span-2 text-xs text-[#647A9B]">
              Recorded batches use a self-paced schedule.
            </p>
          ) : null}
        </FormSection>

        <FormSection
          title="Schedule"
          description={
            hasFixedTime
              ? "Fixed days and session times"
              : "Flexible timing with no fixed schedule"
          }
          contentClassName="gap-4"
        >
          {scheduleTypeField}
          {fixedScheduleFields}
        </FormSection>

        {formFooter}
      </form>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          daysOfWeek: values.hasFixedTime ? values.daysOfWeek : [],
          startTime: values.hasFixedTime ? values.startTime : undefined,
          endTime: values.hasFixedTime ? values.endTime : undefined,
        });
      })}
    >
      <div className="space-y-1.5">
        <Label htmlFor="template-name">Batch Name</Label>
        <Input
          id="template-name"
          placeholder="Morning Batch"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="template-capacity">Capacity</Label>
        <Input
          id="template-capacity"
          type="number"
          min={1}
          step={1}
          placeholder="30"
          {...register("capacity", { valueAsNumber: true })}
        />
        <FieldError message={errors.capacity?.message} />
      </div>

      {modeField}

      {scheduleTypeField}

      {hasFixedTime ? (
        <>
          <BatchDaysField
            daysOfWeek={daysOfWeek}
            onToggleDay={toggleDay}
            error={errors.daysOfWeek?.message}
          />
          <TimeFields register={register} errors={errors} />
        </>
      ) : null}

      {formFooter}
    </form>
  );
}
