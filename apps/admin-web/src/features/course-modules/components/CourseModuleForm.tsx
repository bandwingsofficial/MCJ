"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { WordCount } from "@/src/shared/components/ui/word-count";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { truncateToMaxWords } from "@/src/shared/utils/word-count";

import {
  createCourseModuleSchema,
  CreateCourseModuleForm,
} from "@/src/features/course-modules/schemas/course-module.schema";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";
import {
  getSyncFieldState,
  MODULE_WORD_LIMITS,
} from "@/src/features/course-modules/utils/module-form-validation";

interface CourseModuleFormProps {
  open: boolean;
  loading?: boolean;
  module?: CourseModule;
  courseId: string;
  onClose: () => void;
  onSubmit: (values: CreateCourseModuleForm) => Promise<void>;
}

const defaultValues: CreateCourseModuleForm = {
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
  const isEdit = Boolean(module);
  const [editValidationReady, setEditValidationReady] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<CreateCourseModuleForm>({
    resolver: zodResolver(createCourseModuleSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues,
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const showValidation = Boolean(isSubmitted || editValidationReady);

  useEffect(() => {
    if (!open) {
      setEditValidationReady(false);
      return;
    }

    if (module) {
      reset({
        courseId: module.courseId,
        title: module.title,
        description: module.description ?? "",
        keySkills: module.keySkills ?? [],
      });
      return;
    }

    reset({
      courseId,
      title: "",
      description: "",
      keySkills: [],
    });
  }, [open, module, courseId, reset]);

  useEffect(() => {
    if (!open || !module || editValidationReady) {
      return;
    }

    void trigger().then(() => {
      setEditValidationReady(true);
    });
  }, [open, module, editValidationReady, trigger]);

  const titleState = getSyncFieldState(
    Boolean(touchedFields.title || showValidation),
    errors.title?.message,
    titleValue,
    { required: true },
  );

  const descriptionState = getSyncFieldState(
    Boolean(touchedFields.description || showValidation),
    errors.description?.message,
    descriptionValue,
  );

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Module" : "Create Module"}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit({
            ...values,
            courseId: values.courseId || courseId,
            keySkills: values.keySkills ?? [],
          });
        })}
      >
        <input type="hidden" {...register("courseId")} />

        <ValidatedField
          label="Module Name"
          required
          state={titleState}
          errorMessage={errors.title?.message}
        >
          <Input
            placeholder="Enter module name"
            className={validatedFieldInputClass(titleState)}
            disabled={loading}
            {...register("title")}
          />
        </ValidatedField>

        <ValidatedField
          label="Description"
          state={descriptionState}
          errorMessage={errors.description?.message}
        >
          <Textarea
            rows={4}
            placeholder="Enter module description"
            className={validatedFieldInputClass(descriptionState)}
            disabled={loading}
            value={descriptionValue}
            onChange={(event) => {
              const next = truncateToMaxWords(
                event.target.value,
                MODULE_WORD_LIMITS.moduleDescription,
              );
              setValue("description", next, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onBlur={() => {
              void trigger("description");
            }}
          />
          <WordCount
            value={descriptionValue}
            maxWords={MODULE_WORD_LIMITS.moduleDescription}
          />
        </ValidatedField>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Update Module" : "Create Module"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
