"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { FileUploadField } from "@/src/shared/components/ui/file-upload-field";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import {
  COURSE_RESOURCE_FILE_URL_MAX_LENGTH,
  COURSE_RESOURCE_TITLE_MAX_LENGTH,
  COURSE_RESOURCE_TYPES,
  DEFAULT_COURSE_RESOURCE_FORM_VALUES,
} from "@/src/features/course-resources/constants/course-resource.constants";
import {
  getResourceFileRules,
  getResourceUploadHint,
  isResourceTypeLink,
  validateResourceFileForType,
} from "@/src/features/course-resources/utils/resource-file-validation";
import { getSyncFieldState } from "@/src/features/course-modules/utils/module-form-validation";

import type {
  CourseResource,
  CourseResourceFormValues,
} from "@/src/features/course-resources/types";

const resourceFormSchema = z.object({
  lessonId: z.string(),
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(
      COURSE_RESOURCE_TITLE_MAX_LENGTH,
      `Title cannot exceed ${COURSE_RESOURCE_TITLE_MAX_LENGTH} characters.`,
    ),
  type: z.string().trim().min(1, "Resource type is required."),
  fileUrl: z
    .string()
    .trim()
    .max(
      COURSE_RESOURCE_FILE_URL_MAX_LENGTH,
      `URL cannot exceed ${COURSE_RESOURCE_FILE_URL_MAX_LENGTH} characters.`,
    ),
});

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

export function CourseResourceForm({
  open,
  loading,
  lessonId,
  resource,
  onClose,
  onSubmit,
}: CourseResourceFormProps) {
  const isEdit = Boolean(resource);
  const [editValidationReady, setEditValidationReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileTouched, setFileTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted, isSubmitting },
  } = useForm<CourseResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_COURSE_RESOURCE_FORM_VALUES,
  });

  const titleValue = watch("title");
  const typeValue = watch("type");
  const fileUrlValue = watch("fileUrl");
  const showValidation = Boolean(isSubmitted || editValidationReady);
  const isLinkType = isResourceTypeLink(typeValue);

  const hasFileSource = Boolean(
    selectedFile || (isLinkType ? fileUrlValue.trim() : resource?.fileUrl),
  );

  const fileFieldState = getSyncFieldState(
    Boolean(fileTouched || showValidation),
    fileError ??
      (!hasFileSource && !isEdit
        ? "Resource file is required."
        : !hasFileSource && isEdit && !resource?.fileUrl
          ? "Resource file is required."
          : undefined),
    hasFileSource ? "set" : "",
    { required: true },
  );

  useEffect(() => {
    if (!open) {
      setEditValidationReady(false);
      setSelectedFile(null);
      setFileError(null);
      setFileTouched(false);
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
      lessonId: resource.lessonId,
      title: resource.title,
      type: resource.type,
      fileUrl: isResourceTypeLink(resource.type) ? resource.fileUrl : "",
    });
  }, [open, lessonId, resource, reset]);

  useEffect(() => {
    if (!open || !resource || editValidationReady) {
      return;
    }

    void trigger().then(() => {
      setEditValidationReady(true);
    });
  }, [open, resource, editValidationReady, trigger]);

  useEffect(() => {
    if (!selectedFile || !typeValue) {
      return;
    }

    const validationError = validateResourceFileForType(
      selectedFile,
      typeValue,
    );
    setFileError(validationError);
  }, [selectedFile, typeValue]);

  const handleFormSubmit = handleSubmit(async (values) => {
    setFileTouched(true);

    if (isLinkType) {
      if (!values.fileUrl.trim()) {
        setFileError("Resource file is required.");
        return;
      }

      try {
        z.string().url().parse(values.fileUrl.trim());
      } catch {
        setFileError("Enter a valid URL.");
        return;
      }
    } else if (!selectedFile && !(isEdit && resource?.fileUrl)) {
      setFileError("Resource file is required.");
      return;
    }

    if (selectedFile) {
      const validationError = validateResourceFileForType(
        selectedFile,
        values.type,
      );
      if (validationError) {
        setFileError(validationError);
        return;
      }
    }

    await onSubmit(
      {
        ...values,
        fileUrl: isLinkType ? values.fileUrl.trim() : values.fileUrl,
      },
      selectedFile,
    );
  });

  const titleState = getSyncFieldState(
    Boolean(touchedFields.title || showValidation),
    errors.title?.message,
    titleValue,
    { required: true },
  );

  const typeState = getSyncFieldState(
    Boolean(touchedFields.type || showValidation),
    errors.type?.message,
    typeValue,
    { required: true },
  );

  const linkUrlState = getSyncFieldState(
    Boolean(touchedFields.fileUrl || showValidation),
    fileError && isLinkType ? fileError : errors.fileUrl?.message,
    fileUrlValue,
    { required: isLinkType },
  );

  const fileRules = getResourceFileRules(typeValue);

  return (
    <Modal
      open={open}
      title={resource ? "Edit Resource" : "Create Resource"}
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={(event) => void handleFormSubmit(event)}>
        <ValidatedField
          label="Title"
          required
          state={titleState}
          errorMessage={errors.title?.message}
        >
          <Input
            placeholder="Enter resource title"
            className={validatedFieldInputClass(titleState)}
            disabled={loading || isSubmitting}
            {...register("title")}
          />
        </ValidatedField>

        <ValidatedField
          label="Resource Type"
          required
          state={typeState}
          errorMessage={errors.type?.message}
        >
          <div
            className={validatedFieldInputClass(typeState, "rounded-lg")}
          >
            <AppSelect
              value={typeValue}
              options={COURSE_RESOURCE_TYPES.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              disabled={loading || isSubmitting}
              placeholder="Select Resource Type"
              onValueChange={(value) => {
                setValue("type", value, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
                setSelectedFile(null);
                setFileError(null);
                if (!isResourceTypeLink(value)) {
                  setValue("fileUrl", "", { shouldValidate: true });
                }
              }}
            />
          </div>
        </ValidatedField>

        {isLinkType ? (
          <ValidatedField
            label="Resource URL"
            required
            state={linkUrlState}
            errorMessage={
              fileError && isLinkType ? fileError : errors.fileUrl?.message
            }
          >
            <Input
              placeholder="https://example.com/resource"
              className={validatedFieldInputClass(linkUrlState)}
              disabled={loading || isSubmitting}
              {...register("fileUrl")}
            />
          </ValidatedField>
        ) : (
          <ValidatedField
            label="Resource File"
            required
            state={fileFieldState}
            errorMessage={fileError ?? undefined}
          >
            <FileUploadField
              file={selectedFile}
              existingFileName={
                !selectedFile && resource?.fileUrl
                  ? resource.title
                  : null
              }
              existingFileUrl={
                !selectedFile ? resource?.fileUrl ?? null : null
              }
              disabled={loading || isSubmitting}
              accept={fileRules.accept}
              hint={getResourceUploadHint(typeValue)}
              error={fileError}
              onFileSelect={(file) => {
                setFileTouched(true);
                setSelectedFile(file);
                if (!file) {
                  setFileError(null);
                }
              }}
            />
          </ValidatedField>
        )}

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading || isSubmitting}>
            {resource ? "Update Resource" : "Create Resource"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
