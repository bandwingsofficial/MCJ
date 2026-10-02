"use client";

import { CalendarDays, GraduationCap, Hash, Tag } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  IconValidatedField,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";

import { BatchDurationField } from "@/src/features/batches/components/batch-duration-field";
import type { BatchDurationType } from "@/src/features/batches/types/batch.types";
import {
  batchFieldVisualState,
  batchIconInputClass,
  batchSelectTriggerClass,
} from "@/src/features/batches/utils/batch-form-field-styles";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

type SelectOption = { label: string; value: string };

interface Props {
  idPrefix: string;
  batchName: string;
  onBatchNameChange: (value: string) => void;
  onBatchNameBlur: () => void;
  batchNameTouched: boolean;
  batchNumber: string;
  loadingBatchNumber?: boolean;
  courseId: string;
  onCourseChange: (value: string) => void;
  courseTouched: boolean;
  courseOptions: SelectOption[];
  coursesLoading: boolean;
  durationValue: number;
  durationType: BatchDurationType;
  onDurationValueChange: (value: number) => void;
  onDurationTypeChange: (value: BatchDurationType) => void;
  onDurationBlur: () => void;
  durationTouched: boolean;
  durationError: string | null;
  startDate: string;
  onStartDateChange: (value: string) => void;
  onStartDateBlur: () => void;
  startDateTouched: boolean;
  endDate: string;
  onEndDateChange: (value: string) => void;
  onEndDateBlur: () => void;
  endDateTouched: boolean;
}

function batchNameError(name: string): string | null {
  return name.trim().length === 0 ? "Enter a batch name." : null;
}

function courseError(courseId: string): string | null {
  return courseId ? null : "Select a course.";
}

function startDateFieldError(startDate: string): string | null {
  return startDate ? null : "Select a start date.";
}

function endDateFieldError(
  endDate: string,
  startDate: string,
): string | null {
  if (!endDate) {
    return "Select an end date.";
  }
  if (startDate && endDate < startDate) {
    return "End date must be on or after start date.";
  }
  return null;
}

export function touchAllAssignBatchDetailFields(handlers: {
  setBatchNameTouched: (value: boolean) => void;
  setCourseTouched: (value: boolean) => void;
  setDurationTouched: (value: boolean) => void;
  setStartDateTouched: (value: boolean) => void;
  setEndDateTouched: (value: boolean) => void;
}) {
  handlers.setBatchNameTouched(true);
  handlers.setCourseTouched(true);
  handlers.setDurationTouched(true);
  handlers.setStartDateTouched(true);
  handlers.setEndDateTouched(true);
}

export function AssignBatchCommonDetails({
  idPrefix,
  batchName,
  onBatchNameChange,
  onBatchNameBlur,
  batchNameTouched,
  batchNumber,
  loadingBatchNumber = false,
  courseId,
  onCourseChange,
  courseTouched,
  courseOptions,
  coursesLoading,
  durationValue,
  durationType,
  onDurationValueChange,
  onDurationTypeChange,
  onDurationBlur,
  durationTouched,
  durationError,
  startDate,
  onStartDateChange,
  onStartDateBlur,
  startDateTouched,
  endDate,
  onEndDateChange,
  onEndDateBlur,
  endDateTouched,
}: Props) {
  const nameErr = batchNameError(batchName);
  const batchNameState = batchFieldVisualState(nameErr, batchNameTouched);

  const courseErr = courseError(courseId);
  const courseState = batchFieldVisualState(courseErr, courseTouched);

  const startErr = startDateFieldError(startDate);
  const startDateState = batchFieldVisualState(startErr, startDateTouched);

  const endErr = endDateFieldError(endDate, startDate);
  const endDateState = batchFieldVisualState(endErr, endDateTouched);

  const durationValueState: FieldVisualState = durationTouched
    ? durationError
      ? "invalid"
      : "valid"
    : "neutral";
  const durationTypeState = durationValueState;

  const batchNumberDisplay = loadingBatchNumber
    ? "Generating..."
    : batchNumber
      ? `#${batchNumber}`
      : "—";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#102A56]">
          Common Batch Details
        </h3>
        <p className="mt-0.5 text-xs text-[#647A9B]">
          Shared information that applies to all learning modes.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <IconValidatedField
          label="Batch Name"
          required
          icon={Tag}
          state={batchNameState}
          errorMessage={nameErr}
        >
          <Input
            id={`${idPrefix}-batch-name`}
            value={batchName}
            onChange={(event) => onBatchNameChange(event.target.value)}
            onBlur={onBatchNameBlur}
            placeholder="Enter batch name"
            autoComplete="off"
            className={batchIconInputClass(batchNameState)}
          />
        </IconValidatedField>

        <IconValidatedField
          label="Batch Number"
          icon={Hash}
          state="neutral"
        >
          <Input
            readOnly
            tabIndex={-1}
            value={batchNumberDisplay}
            className={batchIconInputClass("neutral", "bg-slate-50")}
          />
        </IconValidatedField>

        <div className="sm:col-span-2">
          <IconValidatedField
            label="Course"
            required
            icon={GraduationCap}
            select
            state={courseState}
            errorMessage={courseErr}
          >
            <AppSelect
              value={courseId || undefined}
              onValueChange={onCourseChange}
              options={uniqueSelectOptions(courseOptions)}
              placeholder={
                coursesLoading ? "Loading courses..." : "Select a course"
              }
              disabled={coursesLoading}
              triggerClassName={batchSelectTriggerClass(courseState)}
            />
          </IconValidatedField>
        </div>

        <div className="sm:col-span-2">
          <BatchDurationField
            layout="assign"
            idPrefix={idPrefix}
            durationValue={durationValue}
            durationType={durationType}
            onDurationValueChange={onDurationValueChange}
            onDurationTypeChange={onDurationTypeChange}
            onDurationValueBlur={onDurationBlur}
            valueState={durationValueState}
            typeState={durationTypeState}
            errorMessage={durationTouched ? durationError : null}
          />
        </div>

        <IconValidatedField
          label="Start Date"
          required
          icon={CalendarDays}
          state={startDateState}
          errorMessage={startErr}
        >
          <Input
            id={`${idPrefix}-start`}
            type="date"
            autoComplete="off"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            onBlur={onStartDateBlur}
            className={batchIconInputClass(startDateState)}
          />
        </IconValidatedField>

        <IconValidatedField
          label="End Date"
          required
          icon={CalendarDays}
          state={endDateState}
          errorMessage={endErr}
        >
          <Input
            id={`${idPrefix}-end`}
            type="date"
            autoComplete="off"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            onBlur={onEndDateBlur}
            className={batchIconInputClass(endDateState)}
          />
        </IconValidatedField>
      </div>
    </section>
  );
}
