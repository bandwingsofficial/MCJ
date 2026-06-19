"use client";

import { useEffect, useMemo, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  DAYS_OF_WEEK,
  BATCH_MODES,
} from "@/src/features/batches/constants/batch.constants";

import {
  batchSchema,
  BatchFormValues,
} from "@/src/features/batches/schemas/batch.schema";

import { batchMapper } from "@/src/features/batches/utils/batch.mapper";

import { useCreateBatch } from "@/src/features/batches/hooks/useCreateBatch";
import { useUpdateBatch } from "@/src/features/batches/hooks/useUpdateBatch";

import { batchService } from "@/src/features/batches/services/batch.service";

/* Temporary types until Course/Branch/Trainer modules are integrated */

import type {
  Batch,
  BranchOption,
  CourseOption,
  TrainerOption,
} from "@/src/features/batches/types/batch.types";
import { Loader } from "lucide-react";


interface BatchFormProps {
  mode: "create" | "edit";
  batch?: Batch;
  onSuccess?: () => void;
}

export function BatchForm({
  mode,
  batch,
  onSuccess,
}: BatchFormProps) {
  const { createBatch, isLoading: isCreating } =
    useCreateBatch();

  const { updateBatch, isLoading: isUpdating } =
    useUpdateBatch();

  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [branches, setBranches] = useState<BranchOption[]>([]);

  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] =
  useState(true);

  const isSubmitting =
    isCreating || isUpdating;

  const defaultValues = useMemo<BatchFormValues>(() => {
    if (mode === "edit" && batch) {
      return batchMapper.toForm(batch) as unknown as BatchFormValues;
    }

    return {
      name: "",
      code: "",
      description: "",
      courseId: "",
      branchId: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
      capacity: 1,
      enrolledCount: 0,
      mode: "ONLINE",
      classroom: "",
      meetingLink: "",
      isFeatured: false,
      trainerIds: [],
    } as unknown as BatchFormValues;
  }, [mode, batch]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {
      errors,
    },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema) as any,
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedMode = watch("mode");

  const selectedDays =
    watch("daysOfWeek") || [];

  const selectedTrainerIds =
    watch("trainerIds") || [];

  const featured =
    watch("isFeatured");

  useEffect(() => {
    const loadOptions =
      async () => {
      try {
        setIsLoadingOptions(true);
        const [
          courseResponse,
          branchResponse,
          trainerResponse,
        ] = await Promise.all([
          batchService.getCourses(),
          batchService.getBranches(),
          batchService.getTrainers(),
        ]);

        setCourses(courseResponse);

        setBranches(branchResponse);

        setTrainers(trainerResponse);
      } catch {
        appToast.error(
          "Failed to load form data",
        );
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadOptions();
  }, []);

  const onSubmit = async (
    values: BatchFormValues,
  ) => {
    try {
      if (
        mode === "create"
      ) {
        await createBatch(values);

        appToast.success(
          "Batch created successfully",
        );

        reset();
      } else if (
        batch
      ) {
        await updateBatch(
          batch.id,
          values,
        );

        appToast.success(
          "Batch updated successfully",
        );
      }
      onSuccess?.();
    } catch {
      appToast.error(
        "Unable to save batch",
      );
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="flex justify-center py-6">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto px-1 py-1">
        <div className="grid gap-1">
          <Label required className="text-xs">
             Batch Name
          </Label>
          <Input
            placeholder="Enter batch name"
            className="h-9 text-sm"
            {...register("name")}
          />
          <FormError
            message={errors.name?.message}
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Batch Code
          </Label>
          <Input
            placeholder="Enter batch code"
            className="h-9 text-sm"
            {...register("code")}
          />
          <FormError
            message={errors.code?.message}
          />
        </div>

        <div className="grid gap-1 md:col-span-2">
          <Label className="text-xs">
             Description
          </Label>
          <Textarea
            placeholder="Enter description"
            className="min-h-[60px] text-sm py-1.5"
            {...register("description")}
          />
          <FormError
            message={
              errors.description?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Course
          </Label>
          <AppSelect
            value={watch("courseId")}
            onValueChange={(value) =>
              setValue(
                "courseId",
                value,
                {
                  shouldValidate: true,
                },
              )
            }
            options={courses.map(
              (course) => ({
                label: course.title,
                value: course.id,
              }),
            )}
          />
          <FormError
            message={
              errors.courseId?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-xs">
             Branch
          </Label>
          <AppSelect
            value={watch("branchId")}
            onValueChange={(value) =>
              setValue(
                "branchId",
                value,
                {
                  shouldValidate: true,
                },
              )
            }
            options={branches.map(
              (branch) => ({
                label:
                  branch.branchName,
                value: branch.id,
              }),
            )}
          />
          <FormError
            message={
              errors.branchId?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Start Date
          </Label>
          <Input
            type="date"
            className="h-9 text-sm"
            {...register("startDate")}
          />
          <FormError
            message={
              errors.startDate?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-xs">
             End Date
          </Label>
          <Input
            type="date"
            className="h-9 text-sm"
            {...register("endDate")}
          />
          <FormError
            message={errors.endDate?.message}
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Start Time
          </Label>
          <Input
            type="time"
            className="h-9 text-sm"
            {...register("startTime")}
          />
          <FormError
            message={errors.startTime?.message}
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             End Time
          </Label>
          <Input
            type="time"
            className="h-9 text-sm"
            {...register("endTime")}
          />
          <FormError
            message={
              errors.endTime?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Capacity
          </Label>
          <Input
            type="number"
            min={1}
            className="h-9 text-sm"
            {...register("capacity", {
              valueAsNumber: true,
            })}
          />
          <FormError
            message={
              errors.capacity?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-xs">
             Enrolled Count
          </Label>
          <Input
            type="number"
            min={0}
            className="h-9 text-sm"
            {...register("enrolledCount", {
              valueAsNumber: true,
            })}
          />
          <FormError
            message={
              errors.enrolledCount
                ?.message
            }
          />
        </div>

        <div className="grid gap-1">
          <Label required className="text-xs">
             Batch Mode
          </Label>
          <AppSelect
            value={selectedMode}
            onValueChange={(value) =>
              setValue(
                "mode",
                value as
                  BatchFormValues["mode"],
                {
                  shouldValidate: true,
                },
              )
            }
            options={BATCH_MODES}
          />
          <FormError
            message={
              errors.mode?.message
            }
          />
        </div>

        {selectedMode !== "ONLINE" && (
          <div className="grid gap-1">
            <Label required className="text-xs">
               Classroom
            </Label>
            <Input
              placeholder="Enter classroom"
              className="h-9 text-sm"
              {...register("classroom")}
            />
            <FormError
              message={
                errors.classroom?.message
              }
            />
          </div>
        )}

        {selectedMode !== "OFFLINE" && (
          <div className="grid gap-1">
            <Label required className="text-xs">
               Meeting Link
            </Label>
            <Input
              placeholder="https://..."
              className="h-9 text-sm"
              {...register("meetingLink")}
            />
            <FormError
              message={
                errors.meetingLink
                  ?.message
              }
            />
          </div>
        )}

        <div className="space-y-1 md:col-span-2 py-1">
          <Label className="text-xs">
             Featured Batch
          </Label>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={featured}
              onCheckedChange={(
                checked,
              ) =>
                setValue(
                  "isFeatured",
                  Boolean(checked),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
            <span className="text-xs text-muted-foreground">
               Show this batch on homepage
            </span>
          </div>
        </div>

        <div className="space-y-1 md:col-span-2 py-1">
          <Label required className="text-xs">
             Batch Days
          </Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DAYS_OF_WEEK.map(
              (day) => (
                <div
                  key={day.value}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedDays.includes(
                      day.value,
                    )}
                    onCheckedChange={(
                      checked,
                    ) => {
                      if (checked) {
                        setValue(
                          "daysOfWeek",
                          [
                            ...selectedDays,
                            day.value,
                          ],
                          {
                            shouldValidate:
                              true,
                          },
                        );
                      } else {
                        setValue(
                          "daysOfWeek",
                          selectedDays.filter(
                            (item) =>
                              item !==
                              day.value,
                          ),
                          {
                            shouldValidate:
                              true,
                          },
                        );
                      }
                    }}
                  />
                  <span className="text-xs">
                     {day.label}
                  </span>
                </div>
              ),
            )}
          </div>
          <FormError
            message={
              errors.daysOfWeek?.message
            }
          />
        </div>

        <div className="space-y-1 md:col-span-2 py-1">
          <Label className="text-xs">
             Trainers
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {trainers.map(
              (trainer) => (
                <div
                  key={trainer.id}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={selectedTrainerIds.includes(
                      trainer.id,
                    )}
                    onCheckedChange={(
                      checked,
                    ) => {
                      if (checked) {
                        setValue(
                          "trainerIds",
                          [
                            ...selectedTrainerIds,
                            trainer.id,
                          ],
                          {
                            shouldValidate:true,
                            shouldDirty:true,
                          },
                        );
                      } else {
                        setValue(
                          "trainerIds",
                          selectedTrainerIds.filter(
                            (
                              id,
                            ) =>
                              id !==
                              trainer.id,
                          ),
                          {
                            shouldValidate:
                              true,
                          },
                        );
                      }
                    }}
                  />
                  <span className="text-xs">
                     {trainer.firstName}{" "}
                     {trainer.lastName ??
                       ""}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t mt-2">
        <Button
          type="submit"
          size="sm"
          loading={isSubmitting}
          disabled={isSubmitting}
          className="h-9 px-4 text-sm"
        >
          {mode === "create"
            ? "Create Batch"
            : "Update Batch"}
        </Button>
      </div>
    </form>
  );
}