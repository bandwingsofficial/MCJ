"use client";

import {
  useEffect,
} from "react";
import { useState } from "react";
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
  file: File | null,
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
}: 
CourseResourceFormProps) {
  const [
  selectedFile,
  setSelectedFile,
] = useState<File | null>(null);
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

  setSelectedFile(null);

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
  onSubmit={handleSubmit(
    async (values) => {
      console.log("FORM SUBMITTED");
      console.log("Values:", values);
      console.log("Selected File:", selectedFile);

      await onSubmit(
        values,
        selectedFile
      );
    },
    (errors) => {
      console.log("FORM VALIDATION FAILED");
      console.log(errors);
    }
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
    Resource File
  </Label>

  <Input
    type="file"
    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.jpg,.jpeg,.png,.mp4"
    disabled={
      loading ||
      isSubmitting
    }
    onChange={(event) => {
  const file =
    event.target.files?.[0] ?? null;

  setSelectedFile(file);

  if (file) {
    setValue(
      "fileUrl",
      file.name,
      {
        shouldValidate: true,
      },
    );
  }
}}
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