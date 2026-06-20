"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Loader } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  createEnrollmentSchema,
  CreateEnrollmentForm,
} from "../../schemas";

import {
  Enrollment,
} from "../../types";

import {
  useCreateEnrollment,
} from "../../hooks/useCreateEnrollment";

import {
  useUpdateEnrollment,
} from "../../hooks/useUpdateEnrollment";

import {
  studentService,
} from "@/src/features/students/services/student.service";

import {
  batchService,
} from "@/src/features/batches/services/batch.service";

interface StudentOption {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
}

interface BatchOption {
  id: string;
  name: string;
  code: string;
}

interface EnrollmentFormProps {
  mode: "create" | "edit";

  enrollment?: Enrollment;

  onSuccess?: () => void;
}

export function EnrollmentForm({
  mode,
  enrollment,
  onSuccess,
}: EnrollmentFormProps) {
  const {
    createEnrollment,
    isLoading: isCreating,
  } = useCreateEnrollment();

  const {
    updateEnrollment,
    isLoading: isUpdating,
  } = useUpdateEnrollment();

  const [students, setStudents] =
    useState<StudentOption[]>([]);

  const [batches, setBatches] =
    useState<BatchOption[]>([]);

  const [
    isLoadingOptions,
    setIsLoadingOptions,
  ] = useState(true);

  const isSubmitting =
    isCreating || isUpdating;

  const defaultValues =
    useMemo<CreateEnrollmentForm>(() => {
      if (
        mode === "edit" &&
        enrollment
      ) {
        return {
          studentId:
            enrollment.student.id,

          batchId:
            enrollment.batch.id,

          feeAmount:
            enrollment.feeAmount,

          discountAmount:
            enrollment.discountAmount,

          paidAmount:
            enrollment.paidAmount,

          remarks:
            enrollment.remarks ??
            "",
        };
      }

      return {
        studentId: "",

        batchId: "",

        feeAmount: 0,

        discountAmount: 0,

        paidAmount: 0,

        remarks: "",
      };
    }, [
      mode,
      enrollment,
    ]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {
      errors,
    },
  } = useForm<CreateEnrollmentForm>({
    resolver: zodResolver(
      createEnrollmentSchema,
    ) as any,

    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [
    defaultValues,
    reset,
  ]);

  const feeAmount =
    watch("feeAmount");

  const discountAmount =
    watch("discountAmount");

  const paidAmount =
    watch("paidAmount");

  const finalAmount =
    feeAmount -
    discountAmount;

  const dueAmount =
    finalAmount -
    paidAmount;

  useEffect(() => {
    const loadOptions =
      async () => {
        try {
          setIsLoadingOptions(
            true,
          );

          const [
  studentsResponse,
  batchesResponse,
] =
  await Promise.all([
    studentService.getStudents({
      search: "",
      includeDeleted: false,
    }),
    batchService.getBatches(),
  ]);

          setStudents(
  studentsResponse.data,
);

setBatches(
  batchesResponse.data,
);

        } catch {
          appToast.error(
            "Failed to load form data",
          );
        } finally {
          setIsLoadingOptions(
            false,
          );
        }
      };

    void loadOptions();
  }, []);

  const onSubmit =
    async (
      values: CreateEnrollmentForm,
    ) => {
      try {
        if (
          mode ===
          "create"
        ) {
          await createEnrollment(
            values,
          );

          appToast.success(
            "Enrollment created successfully",
          );

          reset();
        } else if (
          enrollment
        ) {
          await updateEnrollment(
            enrollment.id,
            values,
          );

          appToast.success(
            "Enrollment updated successfully",
          );
        }

        onSuccess?.();
      } catch {
        appToast.error(
          "Unable to save enrollment",
        );
      }
    };

  if (
    isLoadingOptions
  ) {
    return (
      <div className="flex justify-center py-6">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-4"
    >      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto px-1 py-1">

        {/* Student */}

        <div className="grid gap-1">
          <Label
            required
            className="text-xs"
          >
            Student
          </Label>

          <AppSelect
            value={watch("studentId")}
            onValueChange={(
              value,
            ) =>
              setValue(
                "studentId",
                value,
                {
                  shouldValidate: true,
                },
              )
            }
            options={students.map(
              (
                student,
              ) => ({
                value: student.id,
                label: `${student.studentCode} - ${student.firstName} ${student.lastName}`,
              }),
            )}
          />

          <FormError
            message={
              errors.studentId
                ?.message
            }
          />
        </div>

        {/* Batch */}

        <div className="grid gap-1">
          <Label
            required
            className="text-xs"
          >
            Batch
          </Label>

          <AppSelect
            value={watch("batchId")}
            onValueChange={(
              value,
            ) =>
              setValue(
                "batchId",
                value,
                {
                  shouldValidate: true,
                },
              )
            }
            options={batches.map(
              (
                batch,
              ) => ({
                value: batch.id,
                label: `${batch.code} - ${batch.name}`,
              }),
            )}
          />

          <FormError
            message={
              errors.batchId
                ?.message
            }
          />
        </div>

        {/* Fee Amount */}

        <div className="grid gap-1">
          <Label
            required
            className="text-xs"
          >
            Fee Amount
          </Label>

          <Input
            type="number"
            min={0}
            className="h-9 text-sm"
            {...register(
              "feeAmount",
              {
                valueAsNumber: true,
              },
            )}
          />

          <FormError
            message={
              errors.feeAmount
                ?.message
            }
          />
        </div>

        {/* Discount */}

        <div className="grid gap-1">
          <Label className="text-xs">
            Discount
          </Label>

          <Input
            type="number"
            min={0}
            className="h-9 text-sm"
            {...register(
              "discountAmount",
              {
                valueAsNumber: true,
              },
            )}
          />

          <FormError
            message={
              errors
                .discountAmount
                ?.message
            }
          />
        </div>

        {/* Paid */}

        <div className="grid gap-1">
          <Label className="text-xs">
            Paid Amount
          </Label>

          <Input
            type="number"
            min={0}
            className="h-9 text-sm"
            {...register(
              "paidAmount",
              {
                valueAsNumber: true,
              },
            )}
          />

          <FormError
            message={
              errors
                .paidAmount
                ?.message
            }
          />
        </div>

        {/* Final Amount */}

        <div className="grid gap-1">
          <Label className="text-xs">
            Final Amount
          </Label>

          <Input
            readOnly
            value={
              Number.isNaN(
                finalAmount,
              )
                ? 0
                : finalAmount
            }
            className="h-9 text-sm bg-muted"
          />
        </div>

        {/* Due Amount */}

        <div className="grid gap-1">
          <Label className="text-xs">
            Due Amount
          </Label>

          <Input
            readOnly
            value={
              Number.isNaN(
                dueAmount,
              )
                ? 0
                : dueAmount
            }
            className="h-9 text-sm bg-muted"
          />
        </div>

        {/* Remarks */}

        <div className="grid gap-1 md:col-span-2">
          <Label className="text-xs">
            Remarks
          </Label>

          <Textarea
            placeholder="Enter remarks"
            className="min-h-[90px] text-sm"
            {...register(
              "remarks",
            )}
          />

          <FormError
            message={
              errors.remarks
                ?.message
            }
          />
        </div>      </div>

      <div className="rounded-lg border bg-muted/20 p-4">
        <h3 className="mb-3 text-sm font-semibold">
          Payment Summary
        </h3>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Fee Amount
            </p>

            <p className="font-semibold">
              ₹
              {Number(
                feeAmount ?? 0,
              ).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Discount
            </p>

            <p className="font-semibold text-orange-600">
              ₹
              {Number(
                discountAmount ??
                  0,
              ).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Final Amount
            </p>

            <p className="font-semibold text-blue-600">
              ₹
              {Number(
                finalAmount,
              ).toLocaleString()}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Due Amount
            </p>

            <p className="font-semibold text-red-600">
              ₹
              {Number(
                dueAmount,
              ).toLocaleString()}
            </p>
          </div>

        </div>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {mode ===
          "create"
            ? "Create Enrollment"
            : "Update Enrollment"}
        </Button>

      </div>

    </form>
  );
}