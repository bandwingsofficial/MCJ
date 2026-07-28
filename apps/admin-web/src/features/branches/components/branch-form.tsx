"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

import {
  createBranchSchema,
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

interface BranchFormProps {
  defaultValues?: Partial<CreateBranchFormValues>;

  isSubmitting: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateBranchFormValues
  ) => Promise<void>;
}

export function BranchForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
}: BranchFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(
    createBranchSchema
  ) as any,

    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [
    defaultValues,
    reset,
  ]);

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label required>
            Branch Name
          </Label>

          <Input
            {...register(
              "branchName"
            )}
            placeholder="Branch Name"
          />

          <FormError
            message={
              errors
                .branchName
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Branch Code
          </Label>

          <Input
            {...register(
              "branchCode"
            )}
            placeholder="Branch Code"
          />

          <FormError
            message={
              errors
                .branchCode
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Email
          </Label>

          <Input
            {...register(
              "email"
            )}
            placeholder="Email"
          />

          <FormError
            message={
              errors.email
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Phone
          </Label>

          <Input
            {...register(
              "phone"
            )}
            placeholder="Phone"
          />

          <FormError
            message={
              errors.phone
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Address Line 1
          </Label>

          <Input
            {...register(
              "addressLine1"
            )}
          />

          <FormError
            message={
              errors
                .addressLine1
                ?.message
            }
          />
        </div>

        <div>
          <Label>
            Address Line 2
          </Label>

          <Input
            {...register(
              "addressLine2"
            )}
          />
        </div>

        <div>
          <Label required>
            City
          </Label>

          <Input
            {...register(
              "city"
            )}
          />

          <FormError
            message={
              errors.city
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            State
          </Label>

          <Input
            {...register(
              "state"
            )}
          />

          <FormError
            message={
              errors.state
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Country
          </Label>

          <Input
            {...register(
              "country"
            )}
          />

          <FormError
            message={
              errors.country
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Postal Code
          </Label>

          <Input
            {...register(
              "postalCode"
            )}
          />

          <FormError
            message={
              errors
                .postalCode
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Latitude
          </Label>

          <Input
            type="number"
            step="any"
            {...register(
              "latitude"
            )}
          />

          <FormError
            message={
              errors
                .latitude
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Longitude
          </Label>

          <Input
            type="number"
            step="any"
            {...register(
              "longitude"
            )}
          />

          <FormError
            message={
              errors
                .longitude
                ?.message
            }
          />
        </div>
      </div>

      <div>
        <Label>
          Description
        </Label>

        <Textarea
          {...register(
            "description"
          )}
        />

        <FormError
          message={
            errors
              .description
              ?.message
          }
        />
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {submitLabel}
      </Button>
    </form>
  );
}