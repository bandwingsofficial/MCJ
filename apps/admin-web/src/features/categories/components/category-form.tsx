"use client";

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
  defaultValues?: Partial<CreateCategoryFormValues>;

  isLoading?: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateCategoryFormValues
  ) => Promise<void>;
}

export function CategoryForm({
  defaultValues,
  isLoading = false,
  submitLabel,
  onSubmit,
}: Props) {
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
            values
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