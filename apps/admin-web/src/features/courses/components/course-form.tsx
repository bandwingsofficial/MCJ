"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Switch } from "@/src/shared/components/ui/switch";

import {
  COURSE_DURATION_TYPES,
  COURSE_LEVELS,
  COURSE_MODES,
} from "@/src/features/courses/constants/course.constants";

import {
  createCourseSchema,
  CreateCourseFormValues,
} from "@/src/features/courses/schemas/course.schema";

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  defaultValues?: Partial<CreateCourseFormValues>;

  categoryOptions: SelectOption[];

  branchOptions: SelectOption[];

  isLoading?: boolean;

  submitLabel?: string;

  onSubmit: (
    values: CreateCourseFormValues
  ) => Promise<void>;
}

export function CourseForm({
  defaultValues,
  categoryOptions,
  branchOptions,
  isLoading,
  submitLabel = "Save",
  onSubmit,
}: Props) {
  const form =
  useForm<CreateCourseFormValues>({
    resolver:
      zodResolver(
        createCourseSchema
      ) as never,

    defaultValues: {
      title: "",
      tagline: undefined,
      shortDescription: undefined,
      description: undefined,
      categoryId: "",
      branchId: undefined,
      originalPrice: 0,
      discountPrice: 0,
      currency: "INR",
      isFree: false,
      duration: undefined,
      durationType: "DAYS",
      level: "BEGINNER",
      mode: "ONLINE",
      language: "English",
      displayOrder: 0,
      metaTitle: undefined,
      metaDescription: undefined,
      metaKeywords: undefined,
      ...defaultValues,
    },
  });

const {
  register,
  control,
  watch,
  handleSubmit,
  formState: { errors },
} = form;

  const isFree =
    watch("isFree");

  return (
    <form
  onSubmit={handleSubmit(
    async (data) => {
      await onSubmit(data);
    }
  )}
>
      <div className="grid gap-5">
        <div>
          <Label required>
            Title
          </Label>

          <Input
            {...register(
              "title"
            )}
            placeholder="Course title"
          />

          <FormError
            message={
              errors.title
                ?.message
            }
          />
        </div>

        <div>
          <Label>
            Tagline
          </Label>

          <Input
            {...register(
              "tagline"
            )}
            placeholder="Course tagline"
          />
        </div>

        <div>
          <Label>
            Short Description
          </Label>

          <Textarea
            {...register(
              "shortDescription"
            )}
          />
        </div>

        <div>
          <Label>
            Description
          </Label>

          <Textarea
            {...register(
              "description"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label required>
            Category
          </Label>

          <Controller
            control={control}
            name="categoryId"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={
                  categoryOptions
                }
              />
            )}
          />

          <FormError
            message={
              errors
                .categoryId
                ?.message
            }
          />
        </div>

        <div>
          <Label>
            Branch
          </Label>

          <Controller
            control={control}
            name="branchId"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={
                  branchOptions
                }
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div>
          <Label>
            Level
          </Label>

          <Controller
            control={control}
            name="level"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={COURSE_LEVELS.map(
                  (
                    level
                  ) => ({
                    label:
                      level,
                    value:
                      level,
                  })
                )}
              />
            )}
          />
        </div>

        <div>
          <Label>
            Mode
          </Label>

          <Controller
            control={control}
            name="mode"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={COURSE_MODES.map(
                  (
                    mode
                  ) => ({
                    label:
                      mode,
                    value:
                      mode,
                  })
                )}
              />
            )}
          />
        </div>

        <div>
          <Label>
            Language
          </Label>

          <Input
            {...register(
              "language"
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label>
            Duration
          </Label>

          <Input
            type="number"
            {...register(
              "duration",
              {
                valueAsNumber:
                  true,
              }
            )}
          />
        </div>

        <div>
          <Label>
            Duration Type
          </Label>

          <Controller
            control={control}
            name="durationType"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                options={COURSE_DURATION_TYPES.map(
                  (
                    type
                  ) => ({
                    label:
                      type,
                    value:
                      type,
                  })
                )}
              />
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Controller
          control={control}
          name="isFree"
          render={({
            field,
          }) => (
            <Switch
              checked={
                field.value
              }
              onCheckedChange={
                field.onChange
              }
            />
          )}
        />

        <Label>
          Free Course
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <Label>
            Original Price
          </Label>

          <Input
            type="number"
            disabled={
              isFree
            }
            {...register(
              "originalPrice",
              {
                valueAsNumber:
                  true,
              }
            )}
          />
        </div>

        <div>
          <Label>
            Discount Price
          </Label>

          <Input
            type="number"
            disabled={
              isFree
            }
            {...register(
              "discountPrice",
              {
                valueAsNumber:
                  true,
              }
            )}
          />
        </div>
      </div>

      <div className="grid gap-5">
        <div>
          <Label>
            Meta Title
          </Label>

          <Input
            {...register(
              "metaTitle"
            )}
          />
        </div>

        <div>
          <Label>
            Meta Description
          </Label>

          <Textarea
            {...register(
              "metaDescription"
            )}
          />
        </div>

        <div>
          <Label>
            Meta Keywords
          </Label>

          <Input
            {...register(
              "metaKeywords"
            )}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={
            isLoading
          }
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}