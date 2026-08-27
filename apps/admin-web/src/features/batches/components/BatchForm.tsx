"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  CalendarDays,
  Hash,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { WordCount } from "@/src/shared/components/ui/word-count";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { truncateToMaxWords } from "@/src/shared/utils/word-count";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import {
  BATCH_MODES,
  DAYS_OF_WEEK,
} from "@/src/features/batches/constants/batch.constants";
import {
  batchSchema,
  type BatchFormValues,
} from "@/src/features/batches/schemas/batch.schema";
import { batchService } from "@/src/features/batches/services/batch.service";
import {
  countWords,
  DESCRIPTION_WORD_LIMIT,
} from "@/src/features/batches/utils/batch-form.utils";
import {
  calculateTotalWorkingDays,
  formatTotalWorkingDaysLabel,
  isEndDateBeforeStartDate,
} from "@/src/features/batches/utils/batch-schedule.utils";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

interface BatchFormProps {
  isEdit?: boolean;
  defaultValues?: Partial<BatchFormValues>;
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel?: string;
  onSubmit: (values: BatchFormValues) => Promise<void>;
  onCancel?: () => void;
}

const EMPTY_DEFAULTS: BatchFormValues = {
  name: "",
  code: "",
  description: "",
  startDate: new Date().toISOString().split("T")[0]!,
  endDate: new Date().toISOString().split("T")[0]!,
  startTime: "10:00",
  endTime: "12:00",
  daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  capacity: 1,
  enrolledCount: 0,
  mode: "ONLINE",
  isFeatured: false,
};

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

type SyncFieldName = keyof BatchFormValues;

function FieldIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="pointer-events-none absolute right-9 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden="true"
    />
  );
}

function iconInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    "pr-16",
    extra,
  );
}

function plainInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    extra,
  );
}

function selectTriggerClass(state: FieldVisualState) {
  return iconInputClass(state);
}

function IconField({
  label,
  required,
  state,
  errorMessage,
  checkingMessage,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string;
  checkingMessage?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <ValidatedField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      checkingMessage={checkingMessage}
    >
      <div className="relative">{children}</div>
    </ValidatedField>
  );
}

export function BatchForm({
  isEdit = false,
  defaultValues,
  isSubmitting,
  submitLabel,
  loadingLabel,
  onCancel,
  onSubmit,
}: BatchFormProps) {
  const suggestRequestIdRef = useRef(0);
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);

  const mergedDefaults = useMemo(
    () => ({
      ...EMPTY_DEFAULTS,
      ...defaultValues,
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: mergedDefaults,
  });

  const values = watch();
  const selectedDays = values.daysOfWeek ?? [];
  const descriptionWords = countWords(values.description ?? "");

  const totalWorkingDays = useMemo(
    () =>
      calculateTotalWorkingDays(
        values.startDate ?? "",
        values.endDate ?? "",
        selectedDays,
      ),
    [selectedDays, values.endDate, values.startDate],
  );

  const totalWorkingDaysLabel = useMemo(
    () => formatTotalWorkingDaysLabel(totalWorkingDays),
    [totalWorkingDays],
  );

  const datesAreValid = useMemo(() => {
    if (!values.startDate?.trim() || !values.endDate?.trim()) {
      return false;
    }

    return !isEndDateBeforeStartDate(values.startDate, values.endDate);
  }, [values.endDate, values.startDate]);

  useEffect(() => {
    if (values.endDate) {
      void trigger("endDate");
    }
  }, [values.startDate, values.endDate, trigger]);

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  useEffect(() => {
    const startTime = values.startTime?.trim();
    const endTime = values.endTime?.trim();

    if (!startTime || !endTime) {
      return;
    }

    if (
      isEdit &&
      startTime === mergedDefaults.startTime &&
      endTime === mergedDefaults.endTime
    ) {
      return;
    }

    const requestId = ++suggestRequestIdRef.current;

    const suggestCode = async () => {
      try {
        setIsSuggestingCode(true);
        const response = await batchService.suggestBatchCode(
          startTime,
          endTime,
        );

        if (requestId !== suggestRequestIdRef.current) {
          return;
        }

        setValue("code", response.data.batchCode, {
          shouldValidate: true,
          shouldDirty: !isEdit,
        });
      } catch (error) {
        if (requestId === suggestRequestIdRef.current) {
          appToast.error(getErrorMessage(error));
        }
      } finally {
        if (requestId === suggestRequestIdRef.current) {
          setIsSuggestingCode(false);
        }
      }
    };

    void suggestCode();
  }, [
    isEdit,
    mergedDefaults.endTime,
    mergedDefaults.startTime,
    setValue,
    values.endTime,
    values.startTime,
  ]);

  const getFieldState = (
    name: SyncFieldName,
    options?: { forceValid?: boolean },
  ): FieldVisualState => {
    if (name === "code" && isSuggestingCode) {
      return "checking";
    }

    if (options?.forceValid) {
      const raw = values[name];
      const hasValue =
        typeof raw === "string"
          ? raw.trim().length > 0
          : raw !== undefined && raw !== null;

      if (hasValue && !errors[name]) {
        return "valid";
      }
    }

    const interacted =
      isEdit ||
      Boolean(touchedFields[name]) ||
      Boolean(dirtyFields[name]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    const raw = values[name];

    if (raw === undefined || raw === null) {
      return "neutral";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      return name === "description" ? "neutral" : "invalid";
    }

    if (Array.isArray(raw) && raw.length === 0) {
      return "invalid";
    }

    return "valid";
  };

  const registerPlainField = (name: SyncFieldName) => {
    const registration = register(name);

    return {
      ...registration,
      className: plainInputClass(getFieldState(name)),
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

  const toggleDay = (day: BatchFormValues["daysOfWeek"][number]) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];

    setValue("daysOfWeek", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const registerField = (name: SyncFieldName) => {
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

  const handleFormSubmit = handleSubmit(async (formValues) => {
    await onSubmit(formValues);
  });

  return (
    <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col bg-white">
      <div className={`${GRID_CLASS} min-h-0 flex-1 overflow-y-auto`}>
        <IconField
          label="Batch Name"
          required
          icon={Tag}
          state={getFieldState("name")}
          errorMessage={errors.name?.message}
        >
          <FieldIcon icon={Tag} />
          <Input
            placeholder="Enter batch name"
            autoComplete="off"
            {...registerField("name")}
            className={iconInputClass(getFieldState("name"))}
          />
        </IconField>

        <IconField
          label="Batch Code"
          required
          icon={Hash}
          state={getFieldState("code", { forceValid: true })}
          checkingMessage="Generating code..."
          errorMessage={errors.code?.message}
        >
          <FieldIcon icon={Hash} />
          <Input
            readOnly
            placeholder="MCJAUGM1001"
            autoComplete="off"
            className={iconInputClass(
              getFieldState("code", { forceValid: true }),
              "bg-slate-50",
            )}
            {...register("code")}
          />
        </IconField>

        <IconField
          label="Batch Type"
          required
          icon={BookOpen}
          state={getFieldState("mode")}
          errorMessage={errors.mode?.message}
        >
          <FieldIcon icon={BookOpen} />
          <AppSelect
            value={values.mode}
            onValueChange={(value) =>
              setValue("mode", value as BatchFormValues["mode"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={uniqueSelectOptions(BATCH_MODES)}
            triggerClassName={selectTriggerClass(getFieldState("mode"))}
          />
        </IconField>

        <div className="md:col-span-2">
          <p className="text-sm font-medium text-[#102A56]">Duration</p>
        </div>

        <ValidatedField
          label="Start Date"
          required
          state={getFieldState("startDate")}
          errorMessage={errors.startDate?.message}
        >
          <Input
            type="date"
            autoComplete="off"
            {...registerPlainField("startDate")}
          />
        </ValidatedField>

        <ValidatedField
          label="End Date"
          required
          state={getFieldState("endDate")}
          errorMessage={errors.endDate?.message}
        >
          <Input
            type="date"
            autoComplete="off"
            {...registerPlainField("endDate")}
          />
        </ValidatedField>

        <div className="md:col-span-2">
          <IconField
            label="Total Working Days"
            icon={CalendarDays}
            state={
              datesAreValid && totalWorkingDays !== null ? "valid" : "neutral"
            }
          >
            <FieldIcon icon={CalendarDays} />
            <Input
              readOnly
              tabIndex={-1}
              value={totalWorkingDaysLabel}
              placeholder="Auto-calculated"
              className={iconInputClass(
                datesAreValid && totalWorkingDays !== null ? "valid" : "neutral",
                "cursor-not-allowed bg-slate-50",
              )}
            />
          </IconField>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-medium text-[#102A56]">Schedule</p>
        </div>

        <div className="md:col-span-2">
          <ValidatedField
            label="Batch Days"
            required
            state={getFieldState("daysOfWeek")}
            errorMessage={errors.daysOfWeek?.message}
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DAYS_OF_WEEK.map((day) => (
                <label
                  key={day.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-slate-700"
                >
                  <Checkbox
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </ValidatedField>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-medium text-slate-700">Daily Timing</p>
        </div>

        <ValidatedField
          label="Start Time"
          required
          state={getFieldState("startTime")}
          errorMessage={errors.startTime?.message}
        >
          <Input
            type="time"
            autoComplete="off"
            {...registerPlainField("startTime")}
          />
        </ValidatedField>

        <ValidatedField
          label="End Time"
          required
          state={getFieldState("endTime")}
          errorMessage={errors.endTime?.message}
        >
          <Input
            type="time"
            autoComplete="off"
            {...registerPlainField("endTime")}
          />
        </ValidatedField>

        <IconField
          label="Capacity"
          required
          icon={Users}
          state={getFieldState("capacity")}
          errorMessage={errors.capacity?.message}
        >
          <FieldIcon icon={Users} />
          <Input
            type="number"
            min={1}
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

        {isEdit ? (
          <IconField label="Enrolled Count" icon={Users} state="neutral">
            <FieldIcon icon={Users} />
            <Input
              type="number"
              min={0}
              autoComplete="off"
              className={iconInputClass("neutral")}
              {...register("enrolledCount", { valueAsNumber: true })}
            />
          </IconField>
        ) : null}

        <div className="md:col-span-2">
          <ValidatedField
            label="Description"
            state={getFieldState("description")}
            errorMessage={
              descriptionWords > DESCRIPTION_WORD_LIMIT
                ? `Description cannot exceed ${DESCRIPTION_WORD_LIMIT} words`
                : errors.description?.message
            }
          >
            <Textarea
              placeholder="Optional batch description"
              autoComplete="off"
              className={validatedFieldInputClass(
                getFieldState("description"),
                "min-h-[88px]",
              )}
              value={values.description ?? ""}
              onChange={(event) => {
                const next = truncateToMaxWords(
                  event.target.value,
                  DESCRIPTION_WORD_LIMIT,
                );
                setValue("description", next, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              onBlur={() => {
                void trigger("description");
              }}
            />
          </ValidatedField>
          <WordCount
            value={values.description ?? ""}
            maxWords={DESCRIPTION_WORD_LIMIT}
            className="mt-1"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={values.isFeatured}
              onCheckedChange={(checked) =>
                setValue("isFeatured", Boolean(checked), {
                  shouldDirty: true,
                })
              }
            />
            Show this batch on homepage
          </label>
        </div>
      </div>

      <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-slate-200 pt-4">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? (loadingLabel ?? `${submitLabel}...`) : submitLabel}
        </Button>
      </div>
    </form>
  );
}
