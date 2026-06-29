"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";

import {
  CommunityHashtagInput,
} from "./CommunityHashtagInput";
import {
  CommunityMediaInput,
} from "./CommunityMediaInput";
import {
  CommunityMentionInput,
} from "./CommunityMentionInput";
import {
  CommunityStatusSelect,
} from "./CommunityStatusSelect";
import {
  CommunityTypeSelect,
} from "./CommunityTypeSelect";

import {
  communitySchema,
  type CommunityFormValues,
} from "@/src/features/community/schemas/community.schema";

import type {
  CommunityPost,
  CreateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

interface CommunityFormProps {
  initialData?: CommunityPost;

  isSubmitting?: boolean;

  onSubmit: (
    values: CreateCommunityPostRequest,
  ) => Promise<void> | void;

  onCancel?: () => void;
}

export function CommunityForm({
  initialData,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CommunityFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useForm<CommunityFormValues>({
    resolver: zodResolver(
      communitySchema,
    ),

    defaultValues: {
      type: "IMAGE",

      caption: "",

      mediaUrl: "",

      hashtags: [],

      mentions: [],

      location: "",

      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (!initialData) {
      return;
    }

    reset({
      type: initialData.type,

      caption:
        initialData.caption,

      mediaUrl:
        initialData.mediaUrl ??
        "",

      hashtags:
        initialData.hashtags,

      mentions:
        initialData.mentions,

      location:
        initialData.location ??
        "",

      status:
        initialData.status,
    });
  }, [
    initialData,
    reset,
  ]);

  const hashtags =
    watch("hashtags");

  const mentions =
    watch("mentions");

  const type =
    watch("type");

  const status =
    watch("status");

  const submitHandler = async (
    values: CommunityFormValues,
  ) => {
    await onSubmit({
      type: values.type,

      caption:
        values.caption,

      mediaUrl:
        values.mediaUrl,

      hashtags:
        values.hashtags,

      mentions:
        values.mentions,

      location:
        values.location ?? "",

      status:
        values.status,
    });
  };
    return (
    <form
      onSubmit={handleSubmit(
        submitHandler,
      )}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label required>
          Caption
        </Label>

        <Textarea
          rows={5}
          placeholder="Write a caption..."
          {...register(
            "caption",
          )}
        />

        <FormError
          message={
            errors.caption
              ?.message
          }
        />
      </div>

      <CommunityMediaInput
        value={watch(
          "mediaUrl",
        )}
        onChange={(
          value,
        ) =>
          setValue(
            "mediaUrl",
            value,
            {
              shouldValidate: true,
            },
          )
        }
        error={
          errors.mediaUrl
            ?.message
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label required>
            Post Type
          </Label>

          <CommunityTypeSelect
            value={type}
            onValueChange={(
              value,
            ) =>
              setValue(
                "type",
                value as
                  | "IMAGE"
                  | "VIDEO",
                {
                  shouldValidate: true,
                },
              )
            }
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
            Status
          </Label>

          <CommunityStatusSelect
            value={status}
            onValueChange={(
              value,
            ) =>
              setValue(
                "status",
                value as
                  | "DRAFT"
                  | "PUBLISHED"
                  | "ARCHIVED",
                {
                  shouldValidate: true,
                },
              )
            }
          />

          <FormError
            message={
              errors.status
                ?.message
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Location
        </Label>

        <Input
          placeholder="Enter location"
          {...register(
            "location",
          )}
        />

        <FormError
          message={
            errors.location
              ?.message
          }
        />
      </div>

      <CommunityHashtagInput
        value={hashtags}
        onChange={(
          hashtags,
        ) =>
          setValue(
            "hashtags",
            hashtags,
            {
              shouldValidate: true,
            },
          )
        }
      />

      <CommunityMentionInput
        value={mentions}
        onChange={(
          mentions,
        ) =>
          setValue(
            "mentions",
            mentions,
            {
              shouldValidate: true,
            },
          )
        }
      />
            <div className="flex items-center justify-end gap-3 border-t pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          loading={isSubmitting}
        >
          {initialData
            ? "Update Post"
            : "Create Post"}
        </Button>
      </div>
    </form>
  );
}