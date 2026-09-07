"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Label } from "@/src/shared/components/ui/label";

import {
  DAYS_OF_WEEK,
  FILTER_BATCH_MODES,
} from "@/src/features/batches/constants/batch.constants";
import {
  batchTemplateSchema,
  type BatchTemplateFormValues,
} from "@/src/features/batch-templates/schemas/batch-template.schema";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

const DEFAULT_VALUES: BatchTemplateFormValues = {
  name: "",
  mode: "OFFLINE",
  hasFixedTime: true,
  daysOfWeek: [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ],
  startTime: "07:00",
  endTime: "09:00",
  isActive: true,
  capacity: 30,
};

type BatchTemplateFormProps = {
  initial?: BatchTemplate | null;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: BatchTemplateFormValues) => Promise<void> | void;
  onCancel: () => void;
};

export function BatchTemplateForm({
  initial,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: BatchTemplateFormProps) {
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
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!initial) {
      reset(DEFAULT_VALUES);
      return;
    }

    reset({
      name: initial.name,
      mode: initial.mode,
      hasFixedTime: initial.hasFixedTime,
      daysOfWeek: initial.daysOfWeek,
      startTime: initial.startTime ?? "07:00",
      endTime: initial.endTime ?? "09:00",
      isActive: initial.isActive,
      capacity: initial.capacity ?? 30,
    });
  }, [initial, reset]);

  const hasFixedTime = watch("hasFixedTime");
  const daysOfWeek = watch("daysOfWeek");

  const toggleDay = (day: BatchTemplateFormValues["daysOfWeek"][number]) => {
    const next = daysOfWeek.includes(day)
      ? daysOfWeek.filter((item) => item !== day)
      : [...daysOfWeek, day];
    setValue("daysOfWeek", next, { shouldValidate: true });
  };

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
        {errors.name ? (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        ) : null}
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
        {errors.capacity ? (
          <p className="text-sm text-red-600">{errors.capacity.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Mode</Label>
        <Controller
          control={control}
          name="mode"
          render={({ field }) => (
            <AppSelect
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                if (value === "RECORDED") {
                  setValue("hasFixedTime", false);
                  setValue("daysOfWeek", []);
                } else if (!hasFixedTime) {
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
              }}
              options={FILTER_BATCH_MODES}
              placeholder="Select mode"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label>Schedule Type</Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm ${
              hasFixedTime
                ? "border-[#102A56] bg-[#102A56] text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() => setValue("hasFixedTime", true)}
          >
            Fixed schedule
          </button>
          <button
            type="button"
            className={`rounded-lg border px-3 py-2 text-sm ${
              !hasFixedTime
                ? "border-[#102A56] bg-[#102A56] text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            onClick={() => {
              setValue("hasFixedTime", false);
              setValue("daysOfWeek", []);
            }}
          >
            Anytime / No fixed time
          </button>
        </div>
      </div>

      {hasFixedTime ? (
        <>
          <div className="space-y-2">
            <Label>Batch Days</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const selected = daysOfWeek.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                      selected
                        ? "border-[#102A56] bg-[#102A56] text-white"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {errors.daysOfWeek ? (
              <p className="text-sm text-red-600">
                {errors.daysOfWeek.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                {...register("startTime")}
              />
              {errors.startTime ? (
                <p className="text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-time">End Time</Label>
              <Input id="end-time" type="time" {...register("endTime")} />
              {errors.endTime ? (
                <p className="text-sm text-red-600">
                  {errors.endTime.message}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
