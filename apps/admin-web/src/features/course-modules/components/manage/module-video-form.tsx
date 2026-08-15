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
import { VideoUploadField } from "@/src/shared/components/ui/video-upload-field";
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

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import type { CourseLesson } from "@/src/features/course-lessons/types";
import {
  getSyncFieldState,
  MODULE_WORD_LIMITS,
  requiredWordsRefine,
  wordLimitRefine,
} from "@/src/features/course-modules/utils/module-form-validation";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

const optionalUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().url().safeParse(value).success,
    { message: "Enter a valid video URL." },
  );

const selfPacedVideoSchema = z
  .object({
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
    videoUrl: optionalUrlSchema,
    duration: z
      .string()
      .trim()
      .min(1, "Duration is required.")
      .refine((value) => isValidDurationHms(value), {
        message: "Enter duration in HH:MM:SS format.",
      }),
    uploadedVideoUrl: z.string().optional(),
  })
  .superRefine((values, context) => {
    const hasUpload = Boolean(values.uploadedVideoUrl?.trim());
    const hasUrl = Boolean(values.videoUrl?.trim());

    if (!hasUpload && !hasUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload a video or provide a video URL.",
        path: ["uploadedVideoUrl"],
      });
    }
  });

type FormValues = z.infer<typeof selfPacedVideoSchema>;

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

export function ModuleVideoForm({
  open,
  loading = false,
  lesson,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = Boolean(lesson);
  const [editValidationReady, setEditValidationReady] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(selfPacedVideoSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: "00:00:00",
      uploadedVideoUrl: "",
    },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const videoUrlValue = watch("videoUrl");
  const durationValue = watch("duration");
  const uploadedVideoUrl = watch("uploadedVideoUrl");

  const showValidation = Boolean(isSubmitted || editValidationReady);

  useEffect(() => {
    if (!open) {
      setEditValidationReady(false);
      setVideoFile(null);
      setUploadError(null);
      return;
    }

    const existingUrl = lesson?.videoUrl ?? "";
    reset({
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: existingUrl,
      duration: formatSecondsToDurationHms(lesson?.duration),
      uploadedVideoUrl: existingUrl,
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

  const previewUrl = uploadedVideoUrl?.trim() || videoUrlValue?.trim();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const response = await courseLessonService.uploadLessonVideo(file);
      const url = response.data?.url ?? "";
      if (!url) {
        throw new Error("Upload succeeded but no URL was returned.");
      }
      setValue("uploadedVideoUrl", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("videoUrl", "", { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      setUploadError(getErrorMessage(error));
      setVideoFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Self-Paced Video" : "Add Self-Paced Video"}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          const videoUrl =
            values.uploadedVideoUrl?.trim() || values.videoUrl.trim();
          const durationSeconds = parseDurationHmsToSeconds(values.duration);
          if (!videoUrl || durationSeconds == null) {
            return;
          }

          await onSubmit({
            title: values.title,
            description: values.description,
            videoUrl,
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
            disabled={loading || isUploading}
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
            disabled={loading || isUploading}
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

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Video Upload</p>
          <VideoUploadField
            file={videoFile}
            uploadedUrl={uploadedVideoUrl}
            uploadedFileName={videoFile?.name}
            isUploading={isUploading}
            error={uploadError ?? errors.uploadedVideoUrl?.message}
            disabled={loading}
            onFileSelect={(file) => {
              setVideoFile(file);
              if (!file) {
                setValue("uploadedVideoUrl", "", { shouldValidate: true });
              }
            }}
            onUpload={handleUpload}
          />
        </div>

        <ValidatedField
          label="Video URL"
          state={getSyncFieldState(
            Boolean(touchedFields.videoUrl || showValidation),
            errors.videoUrl?.message,
            videoUrlValue,
          )}
          errorMessage={errors.videoUrl?.message}
        >
          <Input
            placeholder="https://example.com/video (optional)"
            className={validatedFieldInputClass(
              getSyncFieldState(
                Boolean(touchedFields.videoUrl || showValidation),
                errors.videoUrl?.message,
                videoUrlValue,
              ),
            )}
            disabled={loading || isUploading || Boolean(uploadedVideoUrl)}
            {...register("videoUrl")}
          />
        </ValidatedField>

        {previewUrl ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
            <video controls className="aspect-video w-full" src={previewUrl}>
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
            disabled={loading || isUploading}
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
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isUploading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading || isUploading}>
            {isEdit ? "Update Video" : "Create Video"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
