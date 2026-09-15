"use client";

import { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Hash,
  Link2,
  User,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { ImageUploadField } from "@/src/shared/components/ui/image-upload-field";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { JobTagInput } from "@/src/features/jobs/components/JobTagInput";
import { categoryService } from "@/src/features/categories/services/category.service";

import {
  defaultFinanceNewsFormValues,
  financeNewsFormSchema,
  type FinanceNewsFormValues,
} from "@/src/features/finance-news/schemas/finance-news.schema";
import {
  FINANCE_ARTICLE_STATUS_LABELS,
  FINANCE_ARTICLE_STATUSES,
  SHORT_DESCRIPTION_MAX_CHARS,
} from "@/src/features/finance-news/constants/finance-news.constants";
import type { FinanceNewsFormFieldErrors } from "@/src/features/finance-news/utils/finance-news-form-errors";
import type { FinanceNewsUploadFiles } from "@/src/features/finance-news/hooks/use-create-finance-news";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const GRID_CLASS =
  "grid w-full min-w-0 grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2";

function FieldIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      className="pointer-events-none absolute right-9 z-[1] h-4 w-4 text-slate-400"
      aria-hidden="true"
    />
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="border-b border-[#E8F1FF] pb-1.5 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
      {children}
    </h3>
  );
}

function getFieldState(
  error?: string,
  value?: string,
): FieldVisualState {
  if (error) {
    return "invalid";
  }

  if (value?.trim()) {
    return "valid";
  }

  return "neutral";
}

function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only PNG, JPG, JPEG, and WEBP images are allowed";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller";
  }

  return null;
}

function truncateToMaxChars(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
}

function CharacterCount({
  value,
  maxChars,
}: {
  value: string;
  maxChars: number;
}) {
  const charCount = value.length;
  const isNearLimit = charCount >= maxChars * 0.9;

  return (
    <p
      className={cn(
        "mt-1 text-right text-xs tabular-nums",
        charCount >= maxChars
          ? "text-red-600"
          : isNearLimit
            ? "text-amber-600"
            : "text-slate-500",
      )}
      aria-live="polite"
    >
      {charCount}/{maxChars} characters
    </p>
  );
}

interface Props {
  formId?: string;
  mode: "create" | "edit";
  initialValues?: FinanceNewsFormValues;
  thumbnailPreviewUrl?: string | null;
  bannerPreviewUrl?: string | null;
  isSubmitting?: boolean;
  externalErrors?: FinanceNewsFormFieldErrors;
  onSubmit: (
    values: FinanceNewsFormValues,
    files: FinanceNewsUploadFiles,
  ) => Promise<void>;
  onCancel?: () => void;
}

export function FinanceNewsForm({
  formId = "finance-news-form",
  mode,
  initialValues,
  thumbnailPreviewUrl,
  bannerPreviewUrl,
  isSubmitting = false,
  externalErrors = {},
  onSubmit,
  onCancel,
}: Props) {
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    thumbnailPreviewUrl ?? null,
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    bannerPreviewUrl ?? null,
  );
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [bannerRemoved, setBannerRemoved] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FinanceNewsFormValues>({
    resolver: zodResolver(financeNewsFormSchema),
    defaultValues: initialValues ?? defaultFinanceNewsFormValues,
  });

  const shortDescription = watch("shortDescription") ?? "";

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getCategories({
          search: "",
          page: 1,
          pageSize: 100,
          status: "ACTIVE",
        });
        if (!cancelled) {
          setCategories(
            response.data.map((category) => ({
              id: category.id,
              name: category.name,
            })),
          );
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setThumbnailPreview(thumbnailPreviewUrl ?? null);
  }, [thumbnailPreviewUrl]);

  useEffect(() => {
    setBannerPreview(bannerPreviewUrl ?? null);
  }, [bannerPreviewUrl]);

  const mergedErrors = {
    title: errors.title?.message ?? externalErrors.title,
    slug: errors.slug?.message ?? externalErrors.slug,
    shortDescription:
      errors.shortDescription?.message ?? externalErrors.shortDescription,
    content: errors.content?.message ?? externalErrors.content,
    categoryId: errors.categoryId?.message ?? externalErrors.categoryId,
    authorName: errors.authorName?.message ?? externalErrors.authorName,
    authorImage: errors.authorImage?.message ?? externalErrors.authorImage,
    tags: errors.tags?.message ?? externalErrors.tags,
    status: errors.status?.message ?? externalErrors.status,
  };

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values, {
      thumbnail: thumbnailFile,
      banner: bannerFile,
      removeThumbnail: thumbnailRemoved,
      removeBanner: bannerRemoved,
    });
  });

  return (
    <form id={formId} onSubmit={submitHandler} className="space-y-5">
      {externalErrors.root ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {externalErrors.root}
        </div>
      ) : null}

      <SectionTitle>Article Details</SectionTitle>

      <div className={GRID_CLASS}>
        <ValidatedField
          label="Title"
          required
          state={getFieldState(mergedErrors.title, watch("title"))}
          errorMessage={mergedErrors.title}
        >
          <div className="relative">
            <Input
              {...register("title")}
              disabled={isSubmitting}
              className={validatedFieldInputClass(
                getFieldState(mergedErrors.title, watch("title")),
                "w-full pr-16",
              )}
              placeholder="Enter article title"
            />
            <FieldIcon icon={FileText} />
          </div>
        </ValidatedField>

        <ValidatedField
          label="Slug"
          state={getFieldState(mergedErrors.slug, watch("slug"))}
          errorMessage={mergedErrors.slug}
        >
          <div className="relative">
            <Input
              {...register("slug")}
              disabled={isSubmitting}
              className={validatedFieldInputClass(
                getFieldState(mergedErrors.slug, watch("slug")),
                "w-full pr-16",
              )}
              placeholder="optional-slug"
            />
            <FieldIcon icon={Hash} />
          </div>
        </ValidatedField>
      </div>

      <ValidatedField
        label="Short Description"
        state={getFieldState(
          mergedErrors.shortDescription,
          shortDescription,
        )}
        errorMessage={mergedErrors.shortDescription}
      >
        <Controller
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <Textarea
              value={field.value ?? ""}
              disabled={isSubmitting}
              rows={3}
              className={validatedFieldInputClass(
                getFieldState(
                  mergedErrors.shortDescription,
                  field.value ?? "",
                ),
                "w-full resize-y",
              )}
              placeholder="Brief summary for listings and previews"
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(
                  truncateToMaxChars(
                    event.target.value,
                    SHORT_DESCRIPTION_MAX_CHARS,
                  ),
                );
              }}
            />
          )}
        />
        <CharacterCount
          value={shortDescription}
          maxChars={SHORT_DESCRIPTION_MAX_CHARS}
        />
      </ValidatedField>

      <ValidatedField
        label="Content"
        required
        state={getFieldState(mergedErrors.content, watch("content"))}
        errorMessage={mergedErrors.content}
      >
        <Textarea
          {...register("content")}
          disabled={isSubmitting}
          rows={10}
          className={validatedFieldInputClass(
            getFieldState(mergedErrors.content, watch("content")),
            "w-full resize-y font-mono text-sm",
          )}
          placeholder="Write the full article content"
        />
      </ValidatedField>

      <SectionTitle>Classification</SectionTitle>

      <div className={GRID_CLASS}>
        <ValidatedField
          label="Category"
          required
          state={getFieldState(mergedErrors.categoryId, watch("categoryId"))}
          errorMessage={mergedErrors.categoryId}
        >
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <AppSelect
                value={field.value || undefined}
                disabled={isSubmitting || categoriesLoading}
                triggerClassName={validatedFieldInputClass(
                  getFieldState(mergedErrors.categoryId, field.value),
                  "h-[46px] w-full",
                )}
                placeholder={
                  categoriesLoading ? "Loading categories..." : "Select category"
                }
                onValueChange={field.onChange}
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Publish Status"
          required
          state={getFieldState(mergedErrors.status, watch("status"))}
          errorMessage={mergedErrors.status}
        >
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <AppSelect
                value={field.value}
                disabled={isSubmitting}
                triggerClassName={validatedFieldInputClass(
                  getFieldState(mergedErrors.status, field.value),
                  "h-[46px] w-full",
                )}
                onValueChange={field.onChange}
                options={FINANCE_ARTICLE_STATUSES.map((status) => ({
                  label: FINANCE_ARTICLE_STATUS_LABELS[status],
                  value: status,
                }))}
              />
            )}
          />
        </ValidatedField>
      </div>

      <ValidatedField
        label="Tags"
        state={getFieldState(mergedErrors.tags, watch("tags")?.join(", "))}
        errorMessage={mergedErrors.tags}
      >
        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <JobTagInput
              values={field.value ?? []}
              disabled={isSubmitting}
              placeholder="Type a tag and press Enter"
              state={getFieldState(
                mergedErrors.tags,
                field.value?.join(", "),
              )}
              onChange={field.onChange}
            />
          )}
        />
      </ValidatedField>

      <SectionTitle>Author</SectionTitle>

      <div className={GRID_CLASS}>
        <ValidatedField
          label="Author Name"
          state={getFieldState(mergedErrors.authorName, watch("authorName"))}
          errorMessage={mergedErrors.authorName}
        >
          <div className="relative">
            <Input
              {...register("authorName")}
              disabled={isSubmitting}
              className={validatedFieldInputClass(
                getFieldState(mergedErrors.authorName, watch("authorName")),
                "w-full pr-16",
              )}
              placeholder="MCJ Team"
            />
            <FieldIcon icon={User} />
          </div>
        </ValidatedField>

        <ValidatedField
          label="Author Image URL"
          state={getFieldState(mergedErrors.authorImage, watch("authorImage"))}
          errorMessage={mergedErrors.authorImage}
        >
          <div className="relative">
            <Input
              {...register("authorImage")}
              disabled={isSubmitting}
              className={validatedFieldInputClass(
                getFieldState(mergedErrors.authorImage, watch("authorImage")),
                "w-full pr-16",
              )}
              placeholder="https://..."
            />
            <FieldIcon icon={Link2} />
          </div>
        </ValidatedField>
      </div>

      <SectionTitle>Media</SectionTitle>

      <div className={GRID_CLASS}>
        <ValidatedField
          label="Thumbnail"
          state={thumbnailError || externalErrors.thumbnail ? "invalid" : "neutral"}
          errorMessage={thumbnailError ?? externalErrors.thumbnail}
        >
          <ImageUploadField
            previewUrl={thumbnailPreview}
            file={thumbnailFile}
            disabled={isSubmitting}
            entityLabel="thumbnail"
            previewAlt="Article thumbnail preview"
            compact
            validateFile={validateImageFile}
            onFileSelect={(file) => {
              if (!file) {
                return;
              }
              const validationError = validateImageFile(file);
              if (validationError) {
                setThumbnailError(validationError);
                return;
              }
              setThumbnailError(null);
              setThumbnailRemoved(false);
              setThumbnailFile(file);
            }}
            onRemove={() => {
              setThumbnailFile(null);
              setThumbnailPreview(null);
              setThumbnailError(null);
              setThumbnailRemoved(true);
            }}
          />
        </ValidatedField>

        <ValidatedField
          label="Banner"
          state={bannerError || externalErrors.banner ? "invalid" : "neutral"}
          errorMessage={bannerError ?? externalErrors.banner}
        >
          <ImageUploadField
            previewUrl={bannerPreview}
            file={bannerFile}
            disabled={isSubmitting}
            entityLabel="banner"
            previewAlt="Article banner preview"
            validateFile={validateImageFile}
            onFileSelect={(file) => {
              if (!file) {
                return;
              }
              const validationError = validateImageFile(file);
              if (validationError) {
                setBannerError(validationError);
                return;
              }
              setBannerError(null);
              setBannerRemoved(false);
              setBannerFile(file);
            }}
            onRemove={() => {
              setBannerFile(null);
              setBannerPreview(null);
              setBannerError(null);
              setBannerRemoved(true);
            }}
          />
        </ValidatedField>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[#E8F1FF] pt-4 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Article"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
