"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";

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

import {
  DAYS_OF_WEEK,
  BATCH_MODES,
  BATCH_STATUSES,
} from "@/src/features/batches/constants/batch.constants";
import {
  batchSchema,
  type BatchFormValues,
} from "@/src/features/batches/schemas/batch.schema";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  BranchOption,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  countWords,
  DESCRIPTION_WORD_LIMIT,
} from "@/src/features/batches/utils/batch-form.utils";
import {
  BATCH_BRANCH_NONE,
  fromBranchSelectValue,
  toBranchSelectValue,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";

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
  courseId: "",
  branchId: "",
  startDate: "",
  endDate: "",
  daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  capacity: 1,
  enrolledCount: 0,
  mode: "ONLINE",
  status: "UPCOMING",
  classroom: "",
  meetingLink: "",
  isFeatured: false,
};

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

type SyncFieldName = keyof BatchFormValues;

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
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
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
  const selectedMode = values.mode;
  const selectedDays = values.daysOfWeek ?? [];
  const descriptionWords = countWords(values.description ?? "");

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      const [coursesResult, branchesResult] = await Promise.allSettled([
        batchService.getCourses(),
        batchService.getBranches(),
      ]);

      if (coursesResult.status === "fulfilled") {
        setCourses(coursesResult.value);
      } else {
        appToast.error(getErrorMessage(coursesResult.reason));
      }

      if (branchesResult.status === "fulfilled") {
        setBranches(branchesResult.value);
      } else {
        appToast.error(getErrorMessage(branchesResult.reason));
      }

      setIsLoadingOptions(false);
    };

    void loadOptions();
  }, []);

  useEffect(() => {
    if (isEdit || isLoadingOptions) {
      return;
    }

    const requestId = ++suggestRequestIdRef.current;

    const suggestCode = async () => {
      try {
        setIsSuggestingCode(true);
        const response = await batchService.suggestBatchCode();

        if (requestId !== suggestRequestIdRef.current) {
          return;
        }

        setValue("code", response.data.batchCode, {
          shouldValidate: true,
          shouldDirty: true,
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
  }, [isEdit, isLoadingOptions, setValue]);

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
      return name === "branchId" || name === "description" ? "neutral" : "invalid";
    }

    if (Array.isArray(raw) && raw.length === 0) {
      return "invalid";
    }

    return "valid";
  };

  const inputClass = (name: SyncFieldName, options?: { forceValid?: boolean }) =>
    validatedFieldInputClass(getFieldState(name, options));

  const registerField = (name: SyncFieldName) => {
    const registration = register(name);

    return {
      ...registration,
      className: inputClass(name),
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

  const selectClass = (name: SyncFieldName) =>
    validatedFieldInputClass(getFieldState(name), "w-full min-w-0");

  const toggleDay = (day: BatchFormValues["daysOfWeek"][number]) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];

    setValue("daysOfWeek", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const courseOptions = uniqueSelectOptions(
    courses.map((course) => ({
      label: course.code ? `${course.title} (${course.code})` : course.title,
      value: course.id,
    })),
  );

  const branchOptions = uniqueSelectOptions([
    { label: "Select branch (optional)", value: BATCH_BRANCH_NONE },
    ...branches.map((branch) => ({
      label: `${branch.branchName} (${branch.branchCode})`,
      value: branch.id,
    })),
  ]);

  const handleFormSubmit = handleSubmit(async (formValues) => {
    await onSubmit(formValues);
  });

  if (isLoadingOptions) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className={`${GRID_CLASS} min-h-0 flex-1 overflow-y-auto`}>
        <ValidatedField
          label="Batch Name"
          required
          state={getFieldState("name")}
          errorMessage={errors.name?.message}
        >
          <Input
            placeholder="Enter batch name"
            autoComplete="off"
            {...registerField("name")}
          />
        </ValidatedField>

        <ValidatedField
          label="Batch Code"
          required
          state={getFieldState("code", { forceValid: true })}
          checkingMessage="Generating code..."
          errorMessage={errors.code?.message}
        >
          <Input
            readOnly
            placeholder="BCH0001"
            autoComplete="off"
            className={validatedFieldInputClass(
              getFieldState("code", { forceValid: true }),
              "bg-slate-50",
            )}
            {...register("code")}
          />
        </ValidatedField>

        <ValidatedField
          label="Course"
          required
          state={getFieldState("courseId")}
          errorMessage={errors.courseId?.message}
        >
          <AppSelect
            value={values.courseId?.trim() ? values.courseId : undefined}
            placeholder="Select course"
            onValueChange={(value) => {
              setValue("courseId", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            options={courseOptions}
            triggerClassName={selectClass("courseId")}
          />
        </ValidatedField>

        <ValidatedField
          label="Branch"
          state={getFieldState("branchId")}
          errorMessage={errors.branchId?.message}
        >
          <AppSelect
            value={toBranchSelectValue(values.branchId)}
            placeholder="Select branch"
            onValueChange={(value) =>
              setValue("branchId", fromBranchSelectValue(value), {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={branchOptions}
            triggerClassName={selectClass("branchId")}
          />
        </ValidatedField>

        <ValidatedField
          label="Batch Type"
          required
          state={getFieldState("mode")}
          errorMessage={errors.mode?.message}
        >
          <AppSelect
            value={selectedMode}
            onValueChange={(value) =>
              setValue("mode", value as BatchFormValues["mode"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={uniqueSelectOptions(BATCH_MODES)}
            triggerClassName={selectClass("mode")}
          />
        </ValidatedField>

        <ValidatedField
          label="Status"
          required
          state={getFieldState("status")}
          errorMessage={errors.status?.message}
        >
          <AppSelect
            value={values.status}
            onValueChange={(value) =>
              setValue("status", value as BatchFormValues["status"], {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            options={uniqueSelectOptions(BATCH_STATUSES)}
            triggerClassName={selectClass("status")}
          />
        </ValidatedField>

        <ValidatedField
          label="Start Date"
          required
          state={getFieldState("startDate")}
          errorMessage={errors.startDate?.message}
        >
          <Input type="date" autoComplete="off" {...registerField("startDate")} />
        </ValidatedField>

        <ValidatedField
          label="End Date"
          required
          state={getFieldState("endDate")}
          errorMessage={errors.endDate?.message}
        >
          <Input type="date" autoComplete="off" {...registerField("endDate")} />
        </ValidatedField>

        <ValidatedField
          label="Capacity"
          required
          state={getFieldState("capacity")}
          errorMessage={errors.capacity?.message}
        >
          <Input
            type="number"
            min={1}
            autoComplete="off"
            {...register("capacity", {
              valueAsNumber: true,
              onBlur: () => {
                void trigger("capacity");
              },
              onChange: () => {
                void trigger("capacity");
              },
            })}
            className={inputClass("capacity")}
          />
        </ValidatedField>

        {isEdit ? (
          <ValidatedField label="Enrolled Count" state="neutral">
            <Input
              type="number"
              min={0}
              autoComplete="off"
              {...register("enrolledCount", { valueAsNumber: true })}
            />
          </ValidatedField>
        ) : null}

        {selectedMode !== "ONLINE" ? (
          <ValidatedField
            label="Classroom"
            required
            state={getFieldState("classroom")}
            errorMessage={errors.classroom?.message}
          >
            <Input
              placeholder="Enter classroom"
              autoComplete="off"
              {...registerField("classroom")}
            />
          </ValidatedField>
        ) : null}

        {selectedMode !== "OFFLINE" ? (
          <ValidatedField
            label="Meeting Link"
            required={selectedMode === "ONLINE"}
            state={getFieldState("meetingLink")}
            errorMessage={errors.meetingLink?.message}
          >
            <Input
              placeholder="https://..."
              autoComplete="off"
              {...registerField("meetingLink")}
            />
          </ValidatedField>
        ) : null}

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
