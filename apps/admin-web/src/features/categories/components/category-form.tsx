"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";

import { Textarea } from "@/src/shared/components/ui/textarea";

import { Label } from "@/src/shared/components/ui/label";

import { FormError } from "@/src/shared/components/ui/form-error";

import { Button } from "@/src/shared/components/ui/button";

import {
  createCategorySchema,
  CreateCategoryFormValues,
} from "@/src/features/categories/schemas/category.schema";

interface Props {
  defaultValues?: Partial<CreateCategoryFormValues> & {
    thumbnailUrl?: string | null;
  };

  isLoading?: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateCategoryFormValues,
    image: File | null
  ) => Promise<void>;
}

export function CategoryForm({
  defaultValues,
  isLoading = false,
  submitLabel,
  onSubmit,
}: Props) {
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(
      defaultValues?.thumbnailUrl ?? null
    );

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl =
      URL.createObjectURL(selectedImage);

    setPreviewUrl(objectUrl);

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

        displayOrder:
          undefined,

        branchId:
          undefined,

        status: "ACTIVE",

        ...defaultValues,
      },
    });

  return (
    <form
      onSubmit={handleSubmit(
        async (values) => {
          await onSubmit(
            values,
            selectedImage
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

        {previewUrl && (
          <div className="mb-3">
            <Image
              src={previewUrl}
              alt="Category"
              width={120}
              height={120}
              className="h-28 w-28 rounded-md border object-cover"
            />
          </div>
        )}

        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file =
              event.target.files?.[0] ??
              null;

            setSelectedImage(file);
          }}
        />
      </div>

      <div>
        <Label>
          Display Order
        </Label>

        <Input
          type="number"
          {...register(
            "displayOrder",
            {
              setValueAs: (
                value
              ) =>
                value === ""
                  ? undefined
                  : Number(
                      value
                    ),
            }
          )}
        />

        <FormError
          message={
            errors.displayOrder
              ?.message
          }
        />
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