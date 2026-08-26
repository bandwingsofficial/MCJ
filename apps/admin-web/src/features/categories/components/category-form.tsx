"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

import Image from "next/image";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Hash,
  ImageIcon,
  ListOrdered,
  Tag,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { WordCount } from "@/src/shared/components/ui/word-count";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import {
  categoryFormSchema,
  CategoryFormValues,
  CATEGORY_DESCRIPTION_MAX_WORDS,
  normalizeCategorySlug,
} from "@/src/features/categories/schemas/category.schema";

import { categoryService } from "@/src/features/categories/services/category.service";
import { mapCategoryApiError } from "@/src/features/categories/utils/category-form-errors";

const AVAILABILITY_DEBOUNCE_MS = 400;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function FieldIcon({
  icon: Icon,
  alignTop = false,
}: {
  icon: LucideIcon;
  alignTop?: boolean;
}) {
  return (
    <Icon
      className={cn(
        "pointer-events-none absolute right-9 z-[1] h-4 w-4 text-slate-400",
        alignTop ? "top-3" : "top-1/2 -translate-y-1/2",
      )}
      aria-hidden="true"
    />
  );
}

function iconInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    "pr-16",
    extra,
  );
}

function IconField({
  label,
  required,
  state,
  errorMessage,
  checkingMessage,
  successMessage,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string;
  checkingMessage?: string;
  successMessage?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <ValidatedField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      checkingMessage={checkingMessage}
      successMessage={successMessage}
    >
      <div className="relative">
        {children}
        <FieldIcon icon={icon} />
      </div>
    </ValidatedField>
  );
}

type SyncFieldName = "description" | "displayOrder";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues> & {
    thumbnailUrl?: string | null;
  };

  /** When set, form is edit mode — do not auto-regenerate slug from name. */
  excludeId?: string;

  isSubmitting: boolean;

  submitLabel: string;

  onSubmit: (
    values: CategoryFormValues,
    image: File | null,
    removeImage: boolean,
  ) => Promise<void>;
}

export function CategoryForm({
  defaultValues,
  excludeId,
  isSubmitting,
  submitLabel,
  onSubmit,
}: CategoryFormProps) {
  const isEdit = Boolean(excludeId);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const slugManuallyEditedRef = useRef(isEdit);
  const lastSuggestedSlugRef = useRef(
    defaultValues?.slug
      ? normalizeCategorySlug(defaultValues.slug)
      : "",
  );
  const nameCheckIdRef = useRef(0);
  const slugCheckIdRef = useRef(0);

  const [nameTouched, setNameTouched] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageTouched, setImageTouched] = useState(isEdit);

  const [nameChecking, setNameChecking] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);

  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [nameAsyncError, setNameAsyncError] = useState<string | null>(null);
  const [slugAsyncError, setSlugAsyncError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.thumbnailUrl ?? null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    setError,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      displayOrder: undefined,
      ...defaultValues,
    },
  });

  const name = watch("name");
  const slug = watch("slug");
  const values = watch();

  useEffect(() => {
    if (!defaultValues || !excludeId) {
      return;
    }

    reset({
      name: "",
      slug: "",
      description: "",
      displayOrder: undefined,
      ...defaultValues,
    });

    slugManuallyEditedRef.current = isEdit;
    lastSuggestedSlugRef.current = defaultValues.slug
      ? normalizeCategorySlug(defaultValues.slug)
      : "";
    setPreviewUrl(defaultValues.thumbnailUrl ?? null);
    setSelectedImage(null);
    setRemoveImage(false);
    setImageBroken(false);
    setImageError(null);
    setRootError(null);
    setNameTouched(true);
    setSlugTouched(true);
    setImageTouched(true);
    setNameAvailable(null);
    setNameAsyncError(null);
    setSlugAvailable(null);
    setSlugAsyncError(null);
  }, [
    excludeId,
    defaultValues?.name,
    defaultValues?.slug,
    defaultValues?.description,
    defaultValues?.displayOrder,
    defaultValues?.thumbnailUrl,
    isEdit,
    reset,
  ]);

  useEffect(() => {
    if (isEdit || slugManuallyEditedRef.current) {
      return;
    }

    const trimmed = (name ?? "").trim();

    if (!trimmed) {
      return;
    }

    const suggested = normalizeCategorySlug(trimmed);
    lastSuggestedSlugRef.current = suggested;
    setValue("slug", suggested, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSlugTouched(true);
  }, [name, isEdit, setValue]);

  useEffect(() => {
    const trimmed = (name ?? "").trim();

    if (!nameTouched || trimmed.length < 1) {
      setNameChecking(false);
      setNameAvailable(null);
      setNameAsyncError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++nameCheckIdRef.current;
      setNameChecking(true);

      try {
        const response = await categoryService.checkAvailability({
          name: trimmed,
          excludeId,
        });

        if (requestId !== nameCheckIdRef.current) {
          return;
        }

        const available = response.data.nameAvailable;
        setNameAvailable(available);
        setNameAsyncError(
          available === false
            ? response.data.nameMessage ??
                "Category name already exists."
            : null,
        );
      } catch {
        if (requestId !== nameCheckIdRef.current) {
          return;
        }
        setNameAvailable(null);
        setNameAsyncError(null);
      } finally {
        if (requestId === nameCheckIdRef.current) {
          setNameChecking(false);
        }
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [name, excludeId, nameTouched]);

  useEffect(() => {
    const trimmed = normalizeCategorySlug(slug ?? "");

    if (!slugTouched || !trimmed) {
      setSlugChecking(false);
      setSlugAvailable(null);
      setSlugAsyncError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++slugCheckIdRef.current;
      setSlugChecking(true);

      try {
        const response = await categoryService.checkAvailability({
          slug: trimmed,
          excludeId,
        });

        if (requestId !== slugCheckIdRef.current) {
          return;
        }

        const available = response.data.slugAvailable;
        setSlugAvailable(available);
        setSlugAsyncError(
          available === false
            ? response.data.slugMessage ??
                "Category slug already exists."
            : null,
        );
      } catch {
        if (requestId !== slugCheckIdRef.current) {
          return;
        }
        setSlugAvailable(null);
        setSlugAsyncError(null);
      } finally {
        if (requestId === slugCheckIdRef.current) {
          setSlugChecking(false);
        }
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [slug, excludeId, slugTouched]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    setImageBroken(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const applyConflictFromError = (error: unknown) => {
    const mapped = mapCategoryApiError(error);

    if (mapped.name) {
      setNameTouched(true);
      setNameAvailable(false);
      setNameAsyncError(mapped.name);
      setError("name", { message: mapped.name });
    }

    if (mapped.slug) {
      setSlugTouched(true);
      setSlugAvailable(false);
      setSlugAsyncError(mapped.slug);
      setError("slug", { message: mapped.slug });
    }

    if (mapped.description) {
      setError("description", { message: mapped.description });
    }

    if (mapped.displayOrder) {
      setError("displayOrder", { message: mapped.displayOrder });
    }

    if (mapped.image) {
      setImageTouched(true);
      setImageError(mapped.image);
    }

    if (mapped.root) {
      setRootError(mapped.root);
    }
  };

  const nameRegister = register("name");
  const slugRegister = register("slug");

  const nameState: FieldVisualState = nameChecking
    ? "checking"
    : nameAvailable === false || errors.name
      ? "invalid"
      : !nameTouched
        ? "neutral"
        : nameAvailable === true
          ? "valid"
          : errors.name
            ? "invalid"
            : "neutral";

  const slugState: FieldVisualState = slugChecking
    ? "checking"
    : slugAvailable === false || errors.slug
      ? "invalid"
      : !slugTouched
        ? "neutral"
        : slugAvailable === true
          ? "valid"
          : errors.slug
            ? "invalid"
            : "neutral";

  const getSyncFieldState = (
    fieldName: SyncFieldName,
  ): FieldVisualState => {
    const interacted =
      Boolean(touchedFields[fieldName]) ||
      Boolean(dirtyFields[fieldName]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (errors[fieldName]) {
      return "invalid";
    }

    const raw = values[fieldName];

    if (raw === undefined || raw === null) {
      return "neutral";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      if (fieldName === "description") {
        return "neutral";
      }

      return "invalid";
    }

    return "valid";
  };

  const syncField = (fieldName: SyncFieldName) => {
    const registration = register(fieldName);
    const state = getSyncFieldState(fieldName);

    return {
      state,
      errorMessage: errors[fieldName]?.message,
      inputProps: {
        ...registration,
        className: iconInputClass(state),
        onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          registration.onBlur(event);
          void trigger(fieldName);
        },
        onChange: (
          event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          registration.onChange(event);
          void trigger(fieldName);
        },
      },
    };
  };

  const descriptionField = syncField("description");
  const displayOrderField = syncField("displayOrder");

  const hasImage =
    Boolean(selectedImage) ||
    (Boolean(previewUrl) && !removeImage && !imageBroken);

  const imageState: FieldVisualState = !imageTouched
    ? "neutral"
    : imageError || !hasImage
      ? "invalid"
      : "valid";

  const validateAndSetFile = (file: File | null) => {
    setImageTouched(true);
    setImageError(null);
    setRootError(null);

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Only JPEG, PNG, WebP, or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 5MB or smaller.");
      return;
    }

    setSelectedImage(file);
    setRemoveImage(false);
  };

  const clearImage = () => {
    setImageTouched(true);
    setSelectedImage(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    setImageBroken(false);
    setImageError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit(async (formValues) => {
        setRootError(null);
        setImageTouched(true);

        if (!hasImage) {
          setImageError("Category image is required.");
          return;
        }

        if (
          nameChecking ||
          slugChecking ||
          nameAvailable === false ||
          slugAvailable === false
        ) {
          return;
        }

        const trimmedName = formValues.name.trim();
        const normalizedSlug = formValues.slug?.trim()
          ? normalizeCategorySlug(formValues.slug)
          : normalizeCategorySlug(trimmedName);

        try {
          setNameChecking(true);
          setSlugChecking(true);

          const response = await categoryService.checkAvailability({
            name: trimmedName,
            slug: normalizedSlug,
            excludeId,
          });

          if (response.data.nameAvailable === false) {
            setNameTouched(true);
            setNameAvailable(false);
            setNameAsyncError(
              response.data.nameMessage ??
                "Category name already exists.",
            );
            return;
          }

          if (response.data.slugAvailable === false) {
            setSlugTouched(true);
            setSlugAvailable(false);
            setSlugAsyncError(
              response.data.slugMessage ??
                "Category slug already exists.",
            );
            return;
          }

          setNameAvailable(true);
          setNameAsyncError(null);
          setSlugAvailable(true);
          setSlugAsyncError(null);
        } catch {
          // If the pre-check fails, still attempt submit and rely on backend.
        } finally {
          setNameChecking(false);
          setSlugChecking(false);
        }

        try {
          await onSubmit(
            {
              ...formValues,
              name: trimmedName,
              slug: normalizedSlug,
            },
            selectedImage,
            removeImage,
          );
        } catch (error) {
          applyConflictFromError(error);
        }
      })}
      className="space-y-5"
      noValidate
    >
      {rootError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {rootError}
        </div>
      ) : null}

      <IconField
        label="Name"
        required
        state={nameState}
        errorMessage={nameAsyncError ?? errors.name?.message}
        successMessage="Available"
        icon={Tag}
      >
        <Input
          {...nameRegister}
          placeholder="Enter category name"
          disabled={isSubmitting}
          className={iconInputClass(nameState)}
          onBlur={(event) => {
            nameRegister.onBlur(event);
            setNameTouched(true);
            void trigger("name");
          }}
          onChange={(event) => {
            nameRegister.onChange(event);
            setNameTouched(true);
            void trigger("name");
          }}
        />
      </IconField>

      <IconField
        label={
          isEdit ? "Slug" : "Slug (auto-generated from name)"
        }
        required={isEdit}
        state={slugState}
        errorMessage={slugAsyncError ?? errors.slug?.message}
        successMessage="Available"
        icon={Hash}
      >
        <Input
          {...slugRegister}
          placeholder="category-slug"
          disabled={isSubmitting}
          className={iconInputClass(slugState)}
          onBlur={(event) => {
            slugRegister.onBlur(event);
            setSlugTouched(true);
            void trigger("slug");
          }}
          onChange={(event) => {
            const value = event.target.value;
            const normalized = normalizeCategorySlug(value);

            if (
              normalized &&
              normalized !== lastSuggestedSlugRef.current
            ) {
              slugManuallyEditedRef.current = true;
            }

            slugRegister.onChange(event);
            setSlugTouched(true);
            void trigger("slug");
          }}
        />
      </IconField>

      <ValidatedField
        label="Description"
        state={descriptionField.state}
        errorMessage={descriptionField.errorMessage}
      >
        <div className="relative">
          <Textarea
            {...descriptionField.inputProps}
            placeholder="Enter category description"
            disabled={isSubmitting}
            className={cn(
              iconInputClass(descriptionField.state),
              "min-h-[96px] resize-y",
            )}
          />
          <FieldIcon icon={FileText} alignTop />
        </div>
        <WordCount
          value={values.description ?? ""}
          maxWords={CATEGORY_DESCRIPTION_MAX_WORDS}
        />
      </ValidatedField>

      <div className="min-w-0">
        <Label required>Category Image</Label>

        {previewUrl && !removeImage && !imageBroken ? (
          <div className="mb-3 flex items-start gap-3">
            <Image
              src={previewUrl}
              alt="Category preview"
              width={112}
              height={112}
              className={`h-28 w-28 rounded-lg border object-cover ${
                imageState === "invalid"
                  ? "border-red-300"
                  : imageState === "valid"
                    ? "border-emerald-400"
                    : "border-slate-200"
              }`}
              onError={() => setImageBroken(true)}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
              >
                Replace Image
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={clearImage}
              >
                <X className="mr-1 h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition ${
              isDragging
                ? "border-blue-400 bg-blue-50/40"
                : imageState === "invalid"
                  ? "border-red-300 bg-red-50/30"
                  : imageState === "valid"
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (isSubmitting) {
                return;
              }
              validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            {imageBroken ? (
              <ImageIcon className="h-8 w-8 text-slate-400" />
            ) : (
              <Upload className="h-8 w-8 text-slate-400" />
            )}

            <p className="text-sm text-slate-600">
              Drag & drop image or choose image
            </p>
            <p className="text-xs text-slate-400">
              JPEG, PNG, WebP, GIF up to 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          disabled={isSubmitting}
          onChange={(event) => {
            validateAndSetFile(event.target.files?.[0] ?? null);
          }}
        />

        <div className="mt-1 min-h-[1.25rem]">
          {imageState === "invalid" && imageError ? (
            <p role="alert" className="text-sm text-red-500">
              {imageError}
            </p>
          ) : imageState === "valid" ? (
            <p className="text-xs text-emerald-600">Image ready</p>
          ) : null}
        </div>
      </div>

      {isEdit ? (
        <>
          <ValidatedField
            label="Display Order"
            state={displayOrderField.state}
            errorMessage={displayOrderField.errorMessage}
          >
            <Input
              type="number"
              min={0}
              step={1}
              placeholder="0"
              disabled={isSubmitting}
              {...register("displayOrder", {
                valueAsNumber: true,
                setValueAs: (value) =>
                  value === "" || Number.isNaN(Number(value))
                    ? undefined
                    : Number(value),
              })}
              className={iconInputClass(displayOrderField.state)}
              onBlur={(event) => {
                displayOrderField.inputProps.onBlur(event);
              }}
              onChange={(event) => {
                displayOrderField.inputProps.onChange(event);
              }}
            />
            <FieldIcon icon={ListOrdered} />
          </ValidatedField>
          <p className="mt-1 text-xs text-slate-500">
            Lower numbers appear first in category lists.
          </p>
        </>
      ) : null}

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          nameChecking ||
          slugChecking ||
          nameAvailable === false ||
          slugAvailable === false
        }
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
