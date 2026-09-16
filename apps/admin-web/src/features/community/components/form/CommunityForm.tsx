"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ImageIcon, MapPin, Type, User } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { CommunityPostPreview } from "@/src/features/community/components/community-post-preview";
import { CommunityMediaCollectionField } from "@/src/features/community/components/form/CommunityMediaCollectionField";
import { CommunityHashtagInput } from "./CommunityHashtagInput";
import { CommunityStatusSelect } from "./CommunityStatusSelect";

import {
  communitySchema,
  defaultCommunityFormValues,
  truncateToMaxChars,
  type CommunityFormValues,
} from "@/src/features/community/schemas/community.schema";

import {
  CAPTION_MAX_CHARS,
  MAX_LOCATION_LENGTH,
} from "@/src/features/community/constants/community.constants";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";
import type { CommunityFormFieldErrors } from "@/src/features/community/utils/community-form-errors";
import type { CommunityUploadFiles } from "@/src/features/community/hooks/use-create-community-post";
import { mapCommunityToFormValues } from "@/src/features/community/utils/map-community-to-form-values";
import {
  deriveCommunityPostTypeFromMedia,
  mapExistingPostMediaToFormItems,
  type CommunityMediaFormItem,
} from "@/src/features/community/utils/community-media.utils";

interface CommunityFormProps {
  mode?: "create" | "edit";
  initialData?: CommunityPostDetails;
  isSubmitting?: boolean;
  externalErrors?: CommunityFormFieldErrors;
  onSubmit: (
    values: CommunityFormValues,
    files: CommunityUploadFiles,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

function getFieldState(error?: string, value?: string): FieldVisualState {
  if (error) {
    return "invalid";
  }

  if (value?.trim()) {
    return "valid";
  }

  return "neutral";
}

export function CommunityForm({
  mode = "create",
  initialData,
  isSubmitting = false,
  externalErrors = {},
  onSubmit,
  onCancel,
}: CommunityFormProps) {
  const [mediaItems, setMediaItems] = useState<CommunityMediaFormItem[]>([]);
  const isCreateMode = mode === "create";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(communitySchema),
    defaultValues: defaultCommunityFormValues,
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset(mapCommunityToFormValues(initialData));
      setMediaItems(mapExistingPostMediaToFormItems(initialData));
      return;
    }

    if (mode === "create") {
      reset(defaultCommunityFormValues);
      setMediaItems([]);
    }
  }, [initialData, mode, reset]);

  const caption = watch("caption");
  const authorName = watch("authorName");
  const hashtags = watch("hashtags");
  const status = watch("status");
  const location = watch("location");

  const captionLength = caption?.length ?? 0;
  const fieldError = (field: keyof CommunityFormValues) =>
    errors[field]?.message ?? externalErrors[field as keyof typeof externalErrors];

  const previewType = useMemo(
    () => deriveCommunityPostTypeFromMedia(mediaItems),
    [mediaItems],
  );

  const submitHandler = async (values: CommunityFormValues) => {
    await onSubmit(values, {
      mediaItems,
    });
  };

  const captionField = (
    <ValidatedField
      label="Caption"
      required
      errorMessage={fieldError("caption") ?? externalErrors.caption}
      state={getFieldState(
        fieldError("caption") ?? externalErrors.caption,
        caption,
      )}
      className="w-full"
    >
      <div className="relative w-full">
        <Textarea
          rows={5}
          placeholder="Write a caption..."
          disabled={isSubmitting}
          className={cn(
            "w-full min-h-[120px] resize-y pr-16",
            validatedFieldInputClass(
              getFieldState(
                fieldError("caption") ?? externalErrors.caption,
                caption,
              ),
            ),
          )}
          {...register("caption", {
            onChange: (event) => {
              const next = truncateToMaxChars(
                event.target.value,
                CAPTION_MAX_CHARS,
              );
              if (next !== event.target.value) {
                setValue("caption", next, { shouldValidate: true });
              }
            },
          })}
        />
        <span
          className={cn(
            "pointer-events-none absolute bottom-2 right-3 text-xs tabular-nums",
            captionLength >= CAPTION_MAX_CHARS
              ? "text-red-600"
              : "text-[#647A9B]",
          )}
        >
          {captionLength}/{CAPTION_MAX_CHARS}
        </span>
      </div>
    </ValidatedField>
  );

  const mediaField = (
    <ValidatedField
      label="Media"
      required={mode === "create"}
      errorMessage={externalErrors.media}
      state={getFieldState(
        externalErrors.media,
        mediaItems.length > 0 ? "selected" : undefined,
      )}
    >
      <CommunityMediaCollectionField
        items={mediaItems}
        disabled={isSubmitting}
        error={externalErrors.media}
        onChange={setMediaItems}
      />
    </ValidatedField>
  );

  const statusField = (
    <ValidatedField
      label="Status"
      required
      errorMessage={fieldError("status")}
      state={getFieldState(fieldError("status"), status)}
    >
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <CommunityStatusSelect
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
    </ValidatedField>
  );

  const locationField = (
    <ValidatedField
      label="Location"
      errorMessage={fieldError("location")}
      state={getFieldState(fieldError("location"), location)}
    >
      <div className="relative">
        <MapPin
          className="pointer-events-none absolute right-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          placeholder="Enter location"
          maxLength={MAX_LOCATION_LENGTH}
          disabled={isSubmitting}
          className={validatedFieldInputClass(
            getFieldState(fieldError("location"), location),
          )}
          {...register("location")}
        />
      </div>
    </ValidatedField>
  );

  const communityNameField = (
    <ValidatedField
      label="Community Name"
      required
      errorMessage={fieldError("authorName")}
      state={getFieldState(fieldError("authorName"), authorName)}
    >
      <div className="relative">
        <User
          className="pointer-events-none absolute right-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          placeholder="MCJ Community"
          disabled={isSubmitting}
          className={validatedFieldInputClass(
            getFieldState(fieldError("authorName"), authorName),
          )}
          {...register("authorName")}
        />
      </div>
    </ValidatedField>
  );

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-5">
        {isCreateMode ? (
          <>
            {mediaField}
            {captionField}
            {communityNameField}
            {statusField}
            {locationField}
            <CommunityHashtagInput
              value={hashtags}
              onChange={(next) =>
                setValue("hashtags", next, { shouldValidate: true })
              }
            />
          </>
        ) : (
          <>
            {mediaField}
            {captionField}
            {statusField}
            {locationField}
            <CommunityHashtagInput
              value={hashtags}
              onChange={(next) =>
                setValue("hashtags", next, { shouldValidate: true })
              }
            />
          </>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-[#E8F1FF] pt-5">
          {onCancel ? (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          ) : null}

          <Button type="submit" loading={isSubmitting}>
            {mode === "edit" ? "Update Post" : "Create Post"}
          </Button>
        </div>
      </div>

      <aside className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          <Type className="h-4 w-4" aria-hidden="true" />
          Live Preview
        </div>
        <CommunityPostPreview
          type={previewType}
          caption={caption}
          authorName={isCreateMode ? authorName : initialData?.authorName}
          mediaItems={mediaItems}
          hashtags={hashtags}
          location={location}
        />
        <p className="text-xs text-[#647A9B]">
          <ImageIcon className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Preview reflects media, caption, community name, hashtags, and location.
        </p>
      </aside>
    </form>
  );
}
