"use client";

import {
  useEffect,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  DEFAULT_COURSE_RESOURCE_FORM_VALUES,
} from "@/src/features/course-resources/constants/course-resource.constants";

import {
  courseResourceSchema,
} from "@/src/features/course-resources/schemas/course-resource.schema";

import type {
  CourseResource,
  CourseResourceFormValues,
} from "@/src/features/course-resources/types";

interface CourseResourceFormProps {
  open: boolean;

  loading: boolean;

  lessonId: string;

  resource?: CourseResource;

  onClose: () => void;

  onSubmit: (
    values: CourseResourceFormValues,
  ) => Promise<void>;
}

const resourceTypeOptions = [
  {
    label: "PDF",
    value: "PDF",
  },
  {
    label: "Video",
    value: "VIDEO",
  },
  {
    label: "Document",
    value: "DOCUMENT",
  },
  {
    label: "Link",
    value: "LINK",
  },
  {
    label: "Image",
    value: "IMAGE",
  },
];

export function CourseResourceForm({
  open,
  loading,
  lessonId,
  resource,
  onClose,
  onSubmit,
}: CourseResourceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<CourseResourceFormValues>({
      resolver:
        zodResolver(
          courseResourceSchema,
        ),

      defaultValues:
        DEFAULT_COURSE_RESOURCE_FORM_VALUES,
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!resource) {
      reset({
        ...DEFAULT_COURSE_RESOURCE_FORM_VALUES,
        lessonId,
      });

      return;
    }

    reset({
      lessonId:
        resource.lessonId,

      title:
        resource.title,

      type:
        resource.type,

      fileUrl:
        resource.fileUrl,
    });
  }, [
    open,
    lessonId,
    resource,
    reset,
  ]);

  return (
    <Modal
      open={open}
      title={
        resource
          ? "Edit Resource"
          : "Create Resource"
      }
      onClose={onClose}
    >
      <form
        className="space-y-6"
        onSubmit={handleSubmit(
          onSubmit,
        )}
      >
        <div className="space-y-2">
          <Label required>
            Title
          </Label>

          <Input
            placeholder="Enter resource title"
            disabled={
              loading ||
              isSubmitting
            }
            {...register(
              "title",
            )}
          />

          <FormError
            message={
              errors.title
                ?.message
            }
          />
        </div>

        <div className="space-y-2">
          <Label required>
            Resource Type
          </Label>

          <AppSelect
            value={
              control._formValues
                .type
            }
            options={
              resourceTypeOptions
            }
            disabled={
              loading ||
              isSubmitting
            }
            onValueChange={(
              value,
            ) =>
              setValue(
                "type",
                value,
              )
            }
            placeholder="Select Resource Type"
          />

          <FormError
            message={
              errors.type
                ?.message
            }
          />
        </div>

        <div className="space-y-2">
          <Label required>
            File URL
          </Label>

          <Input
            placeholder="https://example.com/file.pdf"
            disabled={
              loading ||
              isSubmitting
            }
            {...register(
              "fileUrl",
            )}
          />

          <FormError
            message={
              errors.fileUrl
                ?.message
            }
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={
              loading ||
              isSubmitting
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={
              loading ||
              isSubmitting
            }
          >
            {resource
              ? "Update Resource"
              : "Create Resource"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}