"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useVideoSource } from "@/src/shared/hooks/use-video-source";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { VideoSourcePreview } from "@/src/shared/components/ui/video-source-preview";
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
import { isYouTubeUrl } from "@/src/shared/utils/youtube";
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

const lessonVideoSchema = z
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
    videoUrl: z.string().trim(),
    uploadedVideoUrl: z.string().optional(),
    duration: z.string().trim(),
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

    if (
      !values.duration ||
      !isValidDurationHms(values.duration) ||
      parseDurationHmsToSeconds(values.duration) === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Video duration must be detected before saving.",
        path: ["duration"],
      });
    }
  });

type FormValues = z.infer<typeof lessonVideoSchema>;

export type LessonVideoFormVariant = "self-paced" | "live-recorded";

interface Props {
  variant: LessonVideoFormVariant;
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

const FORM_COPY: Record<
  LessonVideoFormVariant,
  { addTitle: string; editTitle: string }
> = {
  "self-paced": {
    addTitle: "Add Self-Paced Video",
    editTitle: "Edit Self-Paced Video",
  },
  "live-recorded": {
    addTitle: "Add Live Recorded Video",
    editTitle: "Edit Live Recorded Video",
  },
};

export function ModuleLessonVideoForm({
  variant,
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
  const [videoSourceTouched, setVideoSourceTouched] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<FormValues>({
    resolver: zodResolver(lessonVideoSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      uploadedVideoUrl: "",
    },
  });

  const titleValue = watch("title");
  const descriptionValue = watch("description");
  const videoUrlValue = watch("videoUrl");
  const uploadedVideoUrl = watch("uploadedVideoUrl");
  const durationValue = watch("duration");

  const showValidation = Boolean(isSubmitted || editValidationReady);

  const videoSource = useVideoSource({
    videoUrl: videoUrlValue,
    uploadedVideoUrl: uploadedVideoUrl ?? "",
    uploadedFile: videoFile,
    enabled: open,
    touched: videoSourceTouched,
    showValidation,
  });

  useEffect(() => {
    if (!open) {
      setEditValidationReady(false);
      setVideoFile(null);
      setUploadError(null);
      setVideoSourceTouched(false);
      return;
    }

    const existingUrl = lesson?.videoUrl ?? "";
    const youtube = isYouTubeUrl(existingUrl);

    reset({
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      videoUrl: youtube ? existingUrl : "",
      uploadedVideoUrl: youtube ? "" : existingUrl,
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

  useEffect(() => {
    if (!open) {
      return;
    }

    if (videoSource.isResolvingSource) {
      return;
    }

    if (
      videoSource.durationSeconds != null &&
      videoSource.durationSeconds > 0
    ) {
      const nextDuration = formatSecondsToDurationHms(
        videoSource.durationSeconds,
      );
      if (durationValue !== nextDuration) {
        setValue("duration", nextDuration, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
      return;
    }

    if (
      videoSource.previewState === "invalid" ||
      (videoSourceTouched && videoSource.effectiveUrl)
    ) {
      if (durationValue) {
        setValue("duration", "", {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [
    open,
    durationValue,
    setValue,
    videoSource.durationSeconds,
    videoSource.effectiveUrl,
    videoSource.isResolvingSource,
    videoSource.previewState,
    videoSourceTouched,
  ]);

  const previewUrl = videoSource.effectiveUrl;
  const copy = FORM_COPY[variant];

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setVideoSourceTouched(true);

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
      setValue("videoUrl", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch (error) {
      setUploadError(getErrorMessage(error));
      setVideoFile(null);
      setValue("uploadedVideoUrl", "", { shouldValidate: true });
    } finally {
      setIsUploading(false);
    }
  };

  const urlFieldState =
    uploadedVideoUrl?.trim() && !videoUrlValue.trim()
      ? "neutral"
      : videoSource.previewState === "checking"
        ? "checking"
        : videoSource.previewState;

  const combinedUploadError =
    uploadError ??
    errors.uploadedVideoUrl?.message ??
    (showValidation &&
    !uploadedVideoUrl?.trim() &&
    !videoUrlValue.trim() &&
    !videoFile
      ? "Upload a video or provide a video URL."
      : null);

  return (
    <Modal
      open={open}
      title={isEdit ? copy.editTitle : copy.addTitle}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          const videoUrl =
            values.uploadedVideoUrl?.trim() || values.videoUrl.trim();
          const durationSeconds = parseDurationHmsToSeconds(values.duration);
          if (!videoUrl || durationSeconds == null || durationSeconds <= 0) {
            setVideoSourceTouched(true);
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
            error={combinedUploadError}
            disabled={loading}
            onFileSelect={(file) => {
              setVideoFile(file);
              setVideoSourceTouched(true);
              setUploadError(null);
              if (!file) {
                setValue("uploadedVideoUrl", "", { shouldValidate: true });
              }
            }}
            onUpload={handleUpload}
          />
        </div>

        <ValidatedField
          label="Video URL"
          state={urlFieldState}
          errorMessage={
            errors.videoUrl?.message ??
            (videoSource.previewState === "invalid"
              ? videoSource.previewError
              : null)
          }
          successMessage={
            videoSource.previewSuccessMessage &&
            videoSource.previewState === "valid"
              ? videoSource.previewSuccessMessage
              : null
          }
          checkingMessage="Validating video source..."
        >
          <Input
            placeholder="https://youtube.com/watch?v=... or direct video URL"
            className={validatedFieldInputClass(urlFieldState)}
            disabled={
              loading ||
              isUploading ||
              Boolean(uploadedVideoUrl?.trim())
            }
            {...register("videoUrl", {
              onChange: () => {
                setVideoSourceTouched(true);
              },
              onBlur: () => {
                setVideoSourceTouched(true);
                void trigger("videoUrl");
              },
            })}
          />
        </ValidatedField>

        {previewUrl && videoSource.previewState !== "invalid" ? (
          <VideoSourcePreview
            url={previewUrl}
            youtubeVideoId={videoSource.youtubeVideoId}
          />
        ) : null}

        <ValidatedField
          label="Duration"
          required
          state={videoSource.durationState}
          errorMessage={
            errors.duration?.message ?? videoSource.durationError
          }
          checkingMessage="Detecting duration..."
        >
          <Input
            readOnly
            value={
              durationValue ||
              (videoSource.isResolvingSource ? "Detecting..." : "—")
            }
            disabled
            className={validatedFieldInputClass(
              videoSource.durationState,
              "bg-slate-50 text-slate-700",
            )}
          />
        </ValidatedField>

        <input type="hidden" {...register("duration")} />
        <input type="hidden" {...register("uploadedVideoUrl")} />

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading || isUploading || videoSource.isResolvingSource}
          >
            {isEdit ? "Update Video" : "Create Video"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
