"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { BatchTrainer } from "@/src/features/batches/types/batch.types";
import { courseService } from "@/src/features/courses/services/course.service";
import { formatCourseFee } from "@/src/features/courses/utils/format-course-fee.util";
import { getCourseDefaultDiscount } from "@/src/features/courses/utils/get-course-default-discount.util";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";
import type { Student } from "@/src/features/students/types/student.types";
import {
  DEFAULT_STUDENT_ENROLLMENT_FORM_VALUES,
  studentEnrollmentFormSchema,
  type StudentEnrollmentFormValues,
} from "@/src/features/students/schemas/student-enrollment.schema";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

import {
  StudentEnrollmentBatchDetails,
  type StudentEnrollmentBatchDetailsData,
} from "./student-enrollment-batch-details";

interface BatchListOption {
  id: string;
  name: string;
  code: string | null;
}

interface Props {
  mode: "create" | "edit";
  student: Student;
  defaultBatchId?: string;
  defaultValues?: Partial<StudentEnrollmentFormValues>;
  editBatchDetails?: StudentEnrollmentBatchDetailsData & { batchLabel: string };
  isSubmitting?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  onSubmit?: (values: StudentEnrollmentFormValues) => Promise<void>;
  onCancel: () => void;
}

type FieldName = keyof StudentEnrollmentFormValues;

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2";

function isSelectableBatch(batch: {
  isActive?: boolean;
  isDeleted?: boolean;
  status?: string;
}): boolean {
  return (
    batch.isActive !== false &&
    batch.isDeleted !== true &&
    batch.status !== "COMPLETED" &&
    batch.status !== "CANCELLED" &&
    batch.status !== "ARCHIVED"
  );
}

function formatBatchLabel(name: string, code: string | null): string {
  return code ? `${name} (${code})` : name;
}

function formatTrainerNames(trainers: BatchTrainer[]): string {
  if (!trainers.length) {
    return "—";
  }

  return trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" "),
    )
    .join(", ");
}

export function StudentEnrollmentForm({
  mode,
  student,
  defaultBatchId,
  defaultValues,
  editBatchDetails,
  isSubmitting = false,
  submitLabel = "Create Enrollment",
  loadingLabel = "Creating...",
  onSubmit,
  onCancel,
}: Props) {
  const [batches, setBatches] = useState<BatchListOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(mode === "create");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [batchDetails, setBatchDetails] =
    useState<StudentEnrollmentBatchDetailsData | null>(null);
  const [isBatchEligible, setIsBatchEligible] = useState(mode !== "create");

  const mergedDefaults = useMemo(
    () => ({
      ...DEFAULT_STUDENT_ENROLLMENT_FORM_VALUES,
      batchId: defaultBatchId ?? "",
      ...defaultValues,
    }),
    [defaultBatchId, defaultValues],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<StudentEnrollmentFormValues>({
    resolver: zodResolver(studentEnrollmentFormSchema) as any,
    defaultValues: mergedDefaults,
    mode: "onBlur",
  });

  const batchId = watch("batchId");
  const feeAmount = normalizeMoney(watch("feeAmount"));
  const discountAmount = normalizeMoney(watch("discountAmount"));
  const finalAmount = Math.max(0, feeAmount - discountAmount);

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }

    const loadBatches = async () => {
      try {
        setIsLoadingOptions(true);

        const response = await batchService.getBatches({
          ...(student.branchId ? { branchId: student.branchId } : {}),
          page: 1,
          pageSize: 100,
          includeDeleted: false,
        });

        const items = response.data?.items ?? [];

        setBatches(
          items.filter(isSelectableBatch).map((batch) => ({
            id: batch.id,
            name: batch.name,
            code: batch.code,
          })),
        );
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBatches([]);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadBatches();
  }, [mode, student.branchId]);

  useEffect(() => {
    if (mode !== "create" || !batchId) {
      if (mode === "create") {
        setBatchDetails(null);
        setIsBatchEligible(false);
        setValue("feeAmount", 0, { shouldDirty: false, shouldValidate: true });
        setValue("discountAmount", 0, {
          shouldDirty: false,
          shouldValidate: true,
        });
      }
      return;
    }

    const loadBatchDetails = async () => {
      try {
        setIsLoadingDetails(true);

        const batchResponse = await batchService.getBatch(batchId);
        const batch = batchResponse.data;

        if (
          student.branchId &&
          batch.branchId &&
          batch.branchId !== student.branchId
        ) {
          setBatchDetails(null);
          setIsBatchEligible(false);
          appToast.error(
            "Selected batch does not belong to this student's branch.",
          );
          return;
        }

        if (!isSelectableBatch(batch)) {
          setBatchDetails(null);
          setIsBatchEligible(false);
          appToast.error("Selected batch is not available for enrollment.");
          return;
        }

        if (!batch.courseId) {
          setBatchDetails(null);
          setIsBatchEligible(false);
          appToast.error("Selected batch has no course assigned.");
          return;
        }

        const courseResponse = await courseService.getCourse(batch.courseId);
        const course = courseResponse.data;

        if (course.status !== "ACTIVE") {
          setBatchDetails(null);
          setIsBatchEligible(false);
          appToast.error("Course is not available for enrollment.");
          return;
        }

        setIsBatchEligible(true);
        setBatchDetails({
          courseTitle: course.title ?? batch.course?.title ?? "—",
          courseFee: formatCourseFee(course),
          branchName: batch.branch?.branchName ?? "—",
          categoryName:
            course.category?.name ?? course.categoryName ?? "—",
          trainerNames: formatTrainerNames(batch.trainers ?? []),
          startDate: batch.startDate,
          endDate: batch.endDate,
        });

        setValue("feeAmount", normalizeMoney(course.pricing.originalPrice), {
          shouldDirty: false,
          shouldValidate: true,
        });
        setValue("discountAmount", getCourseDefaultDiscount(course), {
          shouldDirty: false,
          shouldValidate: true,
        });
      } catch (error) {
        appToast.error(getErrorMessage(error));
        setBatchDetails(null);
        setIsBatchEligible(false);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    void loadBatchDetails();
  }, [batchId, mode, setValue, student.branchId]);

  const getFieldState = (name: FieldName): FieldVisualState => {
    const hasError = Boolean(errors[name]);
    const isTouched = Boolean(touchedFields[name]) || isSubmitted;

    if (hasError) {
      return "invalid";
    }

    if (isTouched || dirtyFields[name]) {
      return "valid";
    }

    return "neutral";
  };

  const registerField = (name: FieldName) => {
    const registration = register(name);

    return {
      ...registration,
      className: validatedFieldInputClass(getFieldState(name), "w-full min-w-0"),
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

  const batchOptions = uniqueSelectOptions(
    batches.map((batch) => ({
      label: formatBatchLabel(batch.name, batch.code),
      value: batch.id,
    })),
  );

  const detailsToShow =
    mode === "edit" && editBatchDetails
      ? editBatchDetails
      : batchDetails;

  if (isLoadingOptions) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <form
      onSubmit={
        onSubmit ? handleSubmit(onSubmit) : (event) => event.preventDefault()
      }
      className="space-y-4"
      autoComplete="off"
    >
      <div className="space-y-4">
        {mode === "edit" && editBatchDetails ? (
          <div>
            <p className="text-sm font-medium text-slate-700">Batch</p>
            <p className="mt-1 text-sm text-slate-900">
              {editBatchDetails.batchLabel}
            </p>
          </div>
        ) : batches.length === 0 ? (
          <p className="text-sm text-slate-500">
            No eligible batches available for this student.
          </p>
        ) : (
          <ValidatedField
            label="Batch"
            required
            state={getFieldState("batchId")}
            errorMessage={errors.batchId?.message}
          >
            <AppSelect
              value={batchId || undefined}
              placeholder="Select batch"
              options={batchOptions}
              triggerClassName={validatedFieldInputClass(getFieldState("batchId"))}
              onValueChange={(value) => {
                if (!value) {
                  setBatchDetails(null);
                  setValue("feeAmount", 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("discountAmount", 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }

                setValue("batchId", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }}
            />
          </ValidatedField>
        )}

        {detailsToShow ? (
          <StudentEnrollmentBatchDetails
            details={detailsToShow}
            isLoading={mode === "create" && isLoadingDetails}
          />
        ) : null}

        <div className={GRID_CLASS}>
          <ValidatedField
            label="Fee Amount"
            required
            state={getFieldState("feeAmount")}
            errorMessage={errors.feeAmount?.message}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              {...registerField("feeAmount")}
            />
          </ValidatedField>

          <ValidatedField
            label="Discount Amount"
            state={getFieldState("discountAmount")}
            errorMessage={errors.discountAmount?.message}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              {...registerField("discountAmount")}
            />
          </ValidatedField>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Final Amount
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            {formatCurrency(finalAmount)}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            isLoadingDetails ||
            (mode === "create" && (!batchId || !isBatchEligible))
          }
        >
          {isSubmitting ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
