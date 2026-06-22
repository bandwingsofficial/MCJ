"use client";

import { useEffect } from "react";
import {
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";

import {
  createCourseModuleSchema,
  CreateCourseModuleForm,
} from "@/src/features/course-modules/schemas/course-module.schema";

import type {
  CourseModule,
} from "@/src/features/course-modules/types/course-module.types";

interface CourseModuleFormProps {
  open: boolean;

  loading?: boolean;

  module?: CourseModule;

  courseId: string;

  onClose: () => void;

  onSubmit: (
    values: CreateCourseModuleForm
  ) => Promise<void>;
}

const defaultValues: CreateCourseModuleForm =
  {
    courseId: "",

    title: "",

    description: "",

    keySkills: [],
  };

export function CourseModuleForm({
  open,
  loading = false,
  module,
  courseId,
  onClose,
  onSubmit,
}: CourseModuleFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {
      errors,
    },
  } = useForm<CreateCourseModuleForm>({
    
    resolver: zodResolver(
      createCourseModuleSchema
    ),
    

    defaultValues,
  });

  useEffect(() => {
  register("courseId");
}, [register]);

  const keySkills = watch("keySkills");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (module) {
      reset({
  courseId: module.courseId,
  title: module.title,
  description:
    module.description ?? "",
  keySkills:
    module.keySkills ?? [],
});

      return;
    }

   reset({
  courseId: courseId,
  title: "",
  description: "",
  keySkills: [],
});
  }, [
    open,
    module,
    courseId,
    reset,
  ]);

  const submitForm =
    async (
      values: CreateCourseModuleForm
    ) => {
      await onSubmit(values);
    };

  return (
    <Modal
      open={open}
      title={
        module
          ? "Edit Module"
          : "Create Module"
      }
      onClose={onClose}
    >
      <form
  onSubmit={handleSubmit(
    submitForm,
    (errors) => {
      console.log(
        "Validation Errors",
        errors
      );
    }
  )}
>
  <input
  type="hidden"
  {...register("courseId")}
/>
        <div>
          <Label required>
            Module Title
          </Label>

          <Input
            placeholder="Enter module title"
            {...register(
              "title"
            )}
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
            Description
          </Label>

          <Textarea
            placeholder="Enter module description"
            {...register(
              "description"
            )}
          />

          <FormError
            message={
              errors
                .description
                ?.message
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>
              Key Skills
            </Label>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setValue("keySkills", [...keySkills, ""])
              }
            >
              Add Skill
            </Button>
          </div>
          <div className="space-y-3">
            {keySkills.length ===
              0 && (
              <p className="text-sm text-muted-foreground">
                No key skills
                added.
              </p>
            )}

            {keySkills.map(
              (
                _,
                index
              ) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <Input
                    placeholder={`Skill ${
                      index + 1
                    }`}
                    {...register(`keySkills.${index}`)}
                  />

                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      setValue(
                        "keySkills",
                        keySkills.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
              )
            )}

            <FormError
              message={
                errors
                  .keySkills
                  ?.message
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={
              onClose
            }
            disabled={
              loading
            }
          >
            Cancel
          </Button>

          <Button
  type="submit"
  loading={loading}
  onClick={() =>
    console.log("Submit Button Clicked")
  }
>
            {module
              ? "Update Module"
              : "Create Module"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}