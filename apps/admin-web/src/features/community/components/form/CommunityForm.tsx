"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ImageIcon, Link2, MapPin, Type, User } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Switch } from "@/src/shared/components/ui/switch";
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

const PAIR_FIELD_GRID =
  "grid w-full min-w-0 grid-cols-1 items-start gap-x-4 gap-y-4 md:grid-cols-2";

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
  const ctaEnabled = watch("ctaEnabled");
  const ctaButtonName = watch("ctaButtonName");
  const ctaButtonLink = watch("ctaButtonLink");

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
          rows={4}
          placeholder="Write a caption..."
          disabled={isSubmitting}
          className={cn(
            "w-full min-h-[96px] resize-y pr-16",
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

  const ctaFields = (
    <div className="w-full space-y-4 rounded-xl border border-[#E8F1FF] bg-[#F8FBFF]/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#102A56]">Add Button</p>
          <p className="text-xs text-[#647A9B]">
            Optional call-to-action below the post media.
          </p>
        </div>
        <Controller
          control={control}
          name="ctaEnabled"
          render={({ field }) => (
            <Switch
              checked={field.value}
              disabled={isSubmitting}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) {
                  setValue("ctaButtonName", "", { shouldValidate: true });
                  setValue("ctaButtonLink", "", { shouldValidate: true });
                }
              }}
            />
          )}
        />
      </div>

      {ctaEnabled ? (
        <div className={PAIR_FIELD_GRID}>
          <ValidatedField
            label="Button Name"
            className="min-w-0"
            required
            errorMessage={
              fieldError("ctaButtonName") ?? externalErrors.ctaButtonName
            }
            state={getFieldState(
              fieldError("ctaButtonName") ?? externalErrors.ctaButtonName,
              ctaButtonName,
            )}
          >
            <Input
              placeholder="Book Now"
              disabled={isSubmitting}
              className={validatedFieldInputClass(
                getFieldState(
                  fieldError("ctaButtonName") ?? externalErrors.ctaButtonName,
                  ctaButtonName,
                ),
              )}
              {...register("ctaButtonName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Button Link"
            required
            className="min-w-0"
            errorMessage={
              fieldError("ctaButtonLink") ?? externalErrors.ctaButtonLink
            }
            state={getFieldState(
              fieldError("ctaButtonLink") ?? externalErrors.ctaButtonLink,
              ctaButtonLink,
            )}
          >
            <div className="relative">
              <Link2
                className="pointer-events-none absolute right-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                placeholder="https://example.com/book"
                disabled={isSubmitting}
                className={validatedFieldInputClass(
                  getFieldState(
                    fieldError("ctaButtonLink") ?? externalErrors.ctaButtonLink,
                    ctaButtonLink,
                  ),
                )}
                {...register("ctaButtonLink")}
              />
            </div>
          </ValidatedField>
        </div>
      ) : null}
    </div>
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

  const hashtagField = (
    <CommunityHashtagInput
      value={hashtags}
      disabled={isSubmitting}
      error={fieldError("hashtags") ?? externalErrors.hashtags}
      onChange={(next) =>
        setValue("hashtags", next, { shouldValidate: true })
      }
    />
  );

  const createModeFields = (
    <div className="space-y-4">
      {mediaField}
      <div className={PAIR_FIELD_GRID}>
        <div className="min-w-0">{captionField}</div>
        <div className="min-w-0">{communityNameField}</div>
      </div>
      <div className={PAIR_FIELD_GRID}>
        <div className="min-w-0">{statusField}</div>
        <div className="min-w-0">{locationField}</div>
      </div>
      <div className="min-w-0">{ctaFields}</div>
    </div>
  );

  const editModeFields = (
    <div className="space-y-4">
      {mediaField}
      <div className={PAIR_FIELD_GRID}>
        <div className="min-w-0">{captionField}</div>
        <div className="min-w-0">{statusField}</div>
      </div>
      <div className="min-w-0">{locationField}</div>
      <div className="min-w-0">{ctaFields}</div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="flex min-w-0 flex-col gap-6"
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_min(300px,32%)]">
        <div className="min-w-0 space-y-4">
          {isCreateMode ? createModeFields : editModeFields}
        </div>

        <aside className="flex min-w-0 flex-col gap-3">
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
            ctaEnabled={ctaEnabled}
            ctaButtonName={ctaButtonName}
            ctaButtonLink={ctaButtonLink}
          />
          <div className="min-w-0 pt-1">{hashtagField}</div>
          <p className="text-xs text-[#647A9B]">
            <ImageIcon
              className="mr-1 inline h-3.5 w-3.5"
              aria-hidden="true"
            />
            Preview reflects media, caption, community name, hashtags, and
            location.
          </p>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#E8F1FF] pt-5">
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
    </form>
  );
}
