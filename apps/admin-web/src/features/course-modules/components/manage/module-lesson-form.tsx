"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

import type { CourseLesson } from "@/src/features/course-lessons/types";
import {
  getSyncFieldState,
  MODULE_WORD_LIMITS,
  requiredWordsRefine,
  wordLimitRefine,
} from "@/src/features/course-modules/utils/module-form-validation";
import { lessonFormSessionEntity } from "@/src/features/course-modules/utils/modal-form-session.util";
import { useFormSessionReset } from "@/src/shared/hooks/use-form-session-reset";
import { useModalFormSessionKey } from "@/src/shared/hooks/use-modal-form-session-key";

const moduleLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required."),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .refine(
      wordLimitRefine(MODULE_WORD_LIMITS.lessonDescription),
      {
        message: `Description cannot exceed ${MODULE_WORD_LIMITS.lessonDescription} words.`,
      },
    )
    .refine(requiredWordsRefine(1), {
      message: "Description is required.",
    }),
});

type ModuleLessonFormValues = z.infer<typeof moduleLessonSchema>;

interface Props {
  open: boolean;
  loading?: boolean;
  lesson?: CourseLesson;
  onClose: () => void;
  onCancel?: () => void;
  onSubmit: (values: ModuleLessonFormValues) => Promise<void>;
}

export function ModuleLessonForm({
  open,
  loading = false,
  lesson,
  onClose,
  onCancel,
  onSubmit,
}: Props) {
  const isEdit = Boolean(lesson);
  const [editValidationReady, setEditValidationReady] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<ModuleLessonFormValues>({
    resolver: zodResolver(moduleLessonSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { title: "", description: "" },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const showValidation = Boolean(
    isSubmitted || editValidationReady,
  );

  const { sessionKey, discardCreateSession } = useModalFormSessionKey(
    open,
    lessonFormSessionEntity(lesson),
    "module-lesson",
  );

  useFormSessionReset(
    reset,
    sessionKey,
    {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
    },
    {
      onReset: () => {
        setEditValidationReady(false);
      },
    },
  );

  const handleDismiss = () => {
    onClose();
  };

  const handleCancel = () => {
    if (lesson) {
      reset({
        title: lesson.title,
        description: lesson.description ?? "",
      });
      setEditValidationReady(false);
      onCancel?.();
      onClose();
      return;
    }

    discardCreateSession();
    onCancel?.();
    onClose();
  };

  useEffect(() => {
    if (!open || !lesson || editValidationReady) {
      return;
    }

    void trigger().then(() => {
      setEditValidationReady(true);
    });
  }, [open, lesson, editValidationReady, trigger]);

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
    { required: true },
  );

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Lesson" : "Add Lesson"}
      onClose={handleDismiss}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          if (!lesson) {
            discardCreateSession();
          }
        })}
      >
        <ValidatedField
          label="Title"
          required
          state={titleState}
          errorMessage={errors.title?.message}
        >
          <Input
            placeholder="Enter lesson title"
            className={validatedFieldInputClass(titleState)}
            disabled={loading}
            {...register("title")}
          />
        </ValidatedField>

        <ValidatedField
          label="Description"
          required
          state={descriptionState}
          errorMessage={errors.description?.message}
        >
          <Textarea
            rows={4}
            placeholder="Enter lesson description"
            className={validatedFieldInputClass(descriptionState)}
            disabled={loading}
            value={descriptionValue}
            onChange={(event) => {
              const next = truncateToMaxWords(
                event.target.value,
                MODULE_WORD_LIMITS.lessonDescription,
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
            maxWords={MODULE_WORD_LIMITS.lessonDescription}
          />
        </ValidatedField>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Update Lesson" : "Create Lesson"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
