"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { DurationInput } from "@/src/shared/components/ui/duration-input";
import { WordCount } from "@/src/shared/components/ui/word-count";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import {
  formatSecondsToDurationHms,
  isValidDurationHms,
  parseDurationHmsToSeconds,
} from "@/src/shared/utils/duration";
import { truncateToMaxWords } from "@/src/shared/utils/word-count";

import type { CourseLesson } from "@/src/features/course-lessons/types";
import {
  getSyncFieldState,
  MODULE_WORD_LIMITS,
  requiredWordsRefine,
  wordLimitRefine,
} from "@/src/features/course-modules/utils/module-form-validation";

const liveRecordedVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .refine(wordLimitRefine(MODULE_WORD_LIMITS.videoTitle), {
      message: `Title cannot exceed ${MODULE_WORD_LIMITS.videoTitle} words.`,
    }),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .refine(
      wordLimitRefine(MODULE_WORD_LIMITS.videoDescription),
      {
        message: `Description cannot exceed ${MODULE_WORD_LIMITS.videoDescription} words.`,
      },
    )
    .refine(requiredWordsRefine(1), {
      message: "Description is required.",
    }),
  videoUrl: z
    .string()
    .trim()
    .min(1, "Video URL is required.")
    .url("Enter a valid video URL."),
  duration: z
    .string()
    .trim()
    .min(1, "Duration is required.")
    .refine((value) => isValidDurationHms(value), {
      message: "Enter duration in HH:MM:SS format.",
    }),
});

type FormValues = z.infer<typeof liveRecordedVideoSchema>;

interface Props {
  open: boolean;
  loading?: boolean;
  lesson?: CourseLesson;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
  }) => Promise<void>;
}

export function ModuleLiveRecordedVideoForm({
  open,
  loading = false,
  lesson,
  onClose,
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
  } = useForm<FormValues>({
    resolver: zodResolver(liveRecordedVideoSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: "00:00:00",
    },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const videoUrlValue = watch("videoUrl");
  const durationValue = watch("duration");
  const showValidation = Boolean(isSubmitted || editValidationReady);

  useEffect(() => {
    if (!open) {
      setEditValidationReady(false);
      return;
    }

    reset({
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      duration: formatSecondsToDurationHms(lesson?.duration),
    });
  }, [open, lesson, reset]);

  useEffect(() => {
    if (!open || !lesson || editValidationReady) {
      return;
    }

    void trigger().then(() => {
      setEditValidationReady(true);
    });
  }, [open, lesson, editValidationReady, trigger]);

  return (
    <Modal
      open={open}
      title={
        isEdit ? "Edit Live Recorded Video" : "Add Live Recorded Video"
      }
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          const durationSeconds = parseDurationHmsToSeconds(values.duration);
          if (durationSeconds == null) {
            return;
          }

          await onSubmit({
            title: values.title,
            description: values.description,
            videoUrl: values.videoUrl.trim(),
            duration: durationSeconds,
          });
        })}
      >
        <ValidatedField
          label="Title"
          required
          state={getSyncFieldState(
            Boolean(touchedFields.title || showValidation),
            errors.title?.message,
            titleValue,
            { required: true },
          )}
          errorMessage={errors.title?.message}
        >
          <Input
            placeholder="Enter video title"
            className={validatedFieldInputClass(
              getSyncFieldState(
                Boolean(touchedFields.title || showValidation),
                errors.title?.message,
                titleValue,
                { required: true },
              ),
            )}
            disabled={loading}
            value={titleValue}
            onChange={(event) => {
              const next = truncateToMaxWords(
                event.target.value,
                MODULE_WORD_LIMITS.videoTitle,
              );
              setValue("title", next, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onBlur={() => void trigger("title")}
          />
          <WordCount
            value={titleValue}
            maxWords={MODULE_WORD_LIMITS.videoTitle}
          />
        </ValidatedField>

        <ValidatedField
          label="Description"
          required
          state={getSyncFieldState(
            Boolean(touchedFields.description || showValidation),
            errors.description?.message,
            descriptionValue,
            { required: true },
          )}
          errorMessage={errors.description?.message}
        >
          <Textarea
            rows={3}
            placeholder="Enter video description"
            className={validatedFieldInputClass(
              getSyncFieldState(
                Boolean(touchedFields.description || showValidation),
                errors.description?.message,
                descriptionValue,
                { required: true },
              ),
            )}
            disabled={loading}
            value={descriptionValue}
            onChange={(event) => {
              const next = truncateToMaxWords(
                event.target.value,
                MODULE_WORD_LIMITS.videoDescription,
              );
              setValue("description", next, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onBlur={() => void trigger("description")}
          />
          <WordCount
            value={descriptionValue}
            maxWords={MODULE_WORD_LIMITS.videoDescription}
          />
        </ValidatedField>

        <ValidatedField
          label="Video URL"
          required
          state={getSyncFieldState(
            Boolean(touchedFields.videoUrl || showValidation),
            errors.videoUrl?.message,
            videoUrlValue,
            { required: true },
          )}
          errorMessage={errors.videoUrl?.message}
        >
          <Input
            placeholder="https://..."
            className={validatedFieldInputClass(
              getSyncFieldState(
                Boolean(touchedFields.videoUrl || showValidation),
                errors.videoUrl?.message,
                videoUrlValue,
                { required: true },
              ),
            )}
            disabled={loading}
            {...register("videoUrl")}
          />
        </ValidatedField>

        {videoUrlValue?.trim() ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
            <video
              controls
              className="aspect-video w-full"
              src={videoUrlValue.trim()}
            >
              Your browser does not support video playback.
            </video>
          </div>
        ) : null}

        <ValidatedField
          label="Duration"
          required
          state={getSyncFieldState(
            Boolean(touchedFields.duration || showValidation),
            errors.duration?.message,
            durationValue,
            { required: true },
          )}
          errorMessage={errors.duration?.message}
        >
          <DurationInput
            value={durationValue}
            disabled={loading}
            state={getSyncFieldState(
              Boolean(touchedFields.duration || showValidation),
              errors.duration?.message,
              durationValue,
              { required: true },
            )}
            onChange={(value) => {
              setValue("duration", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
            onBlur={() => void trigger("duration")}
          />
        </ValidatedField>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Update Video" : "Create Video"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
