"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { ImageIcon, Upload, X } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";

import { Textarea } from "@/src/shared/components/ui/textarea";

import { Label } from "@/src/shared/components/ui/label";

import { FormError } from "@/src/shared/components/ui/form-error";

import { Button } from "@/src/shared/components/ui/button";

import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "@/src/features/categories/schemas/category.schema";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

interface Props {
  defaultValues?: Partial<CreateCategoryFormValues> & {
    thumbnailUrl?: string | null;
  };

  isLoading?: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateCategoryFormValues,
    image: File | null,
    removeImage: boolean
  ) => Promise<void>;
}

export function CategoryForm({
  defaultValues,
  isLoading = false,
  submitLabel,
  onSubmit,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(
    null
  );

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(
      defaultValues?.thumbnailUrl ?? null
    );

  const [removeImage, setRemoveImage] =
    useState(false);

  const [imageError, setImageError] =
    useState<string | null>(null);

  const [imageBroken, setImageBroken] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl =
      URL.createObjectURL(selectedImage);

    setPreviewUrl(objectUrl);
    setImageBroken(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } =
    useForm<CreateCategoryFormValues>({
      resolver: zodResolver(
        createCategorySchema
      ),

      defaultValues: {
        name: "",
        description: "",
        status: "ACTIVE",
        ...defaultValues,
      },
    });

  const validateAndSetFile = (file: File | null) => {
    setImageError(null);

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError(
        "Only JPEG, PNG, WebP, or GIF images are allowed."
      );
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError(
        "Image must be 5MB or smaller."
      );
      return;
    }

    setSelectedImage(file);
    setRemoveImage(false);
  };

  const clearImage = () => {
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
      onSubmit={handleSubmit(
        async (values) => {
          await onSubmit(
            values,
            selectedImage,
            removeImage
          );
        }
      )}
      className="space-y-4"
    >
      <div>
        <Label required>
          Name
        </Label>

        <Input
          placeholder="Enter category name"
          {...register("name")}
        />

        <FormError
          message={
            errors.name?.message
          }
        />
      </div>

      <div>
        <Label>
          Description
        </Label>

        <Textarea
          placeholder="Enter category description"
          {...register(
            "description"
          )}
        />

        <FormError
          message={
            errors.description
              ?.message
          }
        />
      </div>

      <div>
        <Label>
          Category Image
        </Label>

        {previewUrl && !imageBroken ? (
          <div className="mb-3 flex items-start gap-3">
            <Image
              src={previewUrl}
              alt="Category"
              width={120}
              height={120}
              className="h-28 w-28 rounded-md border object-cover"
              onError={() =>
                setImageBroken(true)
              }
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                Replace Image
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearImage}
              >
                <X className="mr-1 h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition ${
              isDragging
                ? "border-slate-900 bg-slate-50"
                : "border-slate-300 bg-white"
            }`}
            onClick={() =>
              fileInputRef.current?.click()
            }
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() =>
              setIsDragging(false)
            }
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file =
                event.dataTransfer.files?.[0] ??
                null;
              validateAndSetFile(file);
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
          onChange={(event) => {
            const file =
              event.target.files?.[0] ??
              null;
            validateAndSetFile(file);
          }}
        />

        <FormError message={imageError ?? undefined} />
      </div>

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
