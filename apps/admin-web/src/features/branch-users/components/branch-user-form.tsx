"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";

import { Button } from "@/src/shared/components/ui/button";

import { Label } from "@/src/shared/components/ui/label";

import { FormError } from "@/src/shared/components/ui/form-error";

import { AppSelect } from "@/src/shared/components/ui/select";

import {
  createBranchUserSchema,
  updateBranchUserSchema,
  CreateBranchUserFormValues,
  UpdateBranchUserFormValues,
} from "@/src/features/branch-users/schemas/branch-user.schema";

import {
  BRANCH_USER_ROLE_OPTIONS,
} from "@/src/features/branch-users/constants/branch-user.constants";

interface BranchOption {
  label: string;
  value: string;
}

type BranchUserFormValues =
  | CreateBranchUserFormValues
  | UpdateBranchUserFormValues;

interface BranchUserFormProps {
  defaultValues?: Partial<BranchUserFormValues>;

  branchOptions: BranchOption[];

  isSubmitting: boolean;

  submitLabel: string;

  isEdit?: boolean;

  onSubmit: (
    values: BranchUserFormValues
  ) => Promise<void>;
}

export function BranchUserForm({
  defaultValues,
  branchOptions,
  isSubmitting,
  submitLabel,
  isEdit = false,
  onSubmit,
}: BranchUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BranchUserFormValues>({
    resolver: zodResolver(
      isEdit
        ? updateBranchUserSchema
        : createBranchUserSchema
    ) as any,

    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "BRANCH_MANAGER",
      branchId: "",
      permissions: [],
      ...(isEdit
        ? {}
        : { password: "" }),
      ...defaultValues,
    } as any,
  });

  useEffect(() => {
    reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "BRANCH_MANAGER",
      branchId: "",
      permissions: [],
      ...(isEdit
        ? {}
        : { password: "" }),
      ...defaultValues,
    } as any);
  }, [
    defaultValues,
    isEdit,
    reset,
  ]);

  useEffect(() => {
    setValue(
      "permissions" as any,
      [],
      {
        shouldValidate: false,
      }
    );
  }, [setValue]);
  return (
    <form
  onSubmit={handleSubmit(
    (data) => {
      console.log("FORM DATA", data);
      console.log(
  "UPDATE SUBMIT DATA",
  data
);

void onSubmit(data);
    },
    (errors) => {
  console.log(
    "FORM ERRORS",
    errors
  );
}
  )}
>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label required>
            First Name
          </Label>

          <Input
            {...register(
              "firstName"
            )}
            placeholder="First Name"
          />

          <FormError
            message={
              errors.firstName
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Last Name
          </Label>

          <Input
            {...register(
              "lastName"
            )}
            placeholder="Last Name"
          />

          <FormError
            message={
              errors.lastName
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Email
          </Label>

          <Input
            {...register("email")}
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
            {...register("phone")}
            placeholder="Phone"
          />

          <FormError
            message={
              errors.phone
                ?.message
            }
          />
        </div>

        {!isEdit && (
          <div>
            <Label required>
              Password
            </Label>

            <Input
              type="password"
              {...register(
                "password"
              )}
              placeholder="Password"
            />

            <FormError
              message={
                errors.password
                  ?.message
              }
            />
          </div>
        )}

        <div>
          <Label required>
            Branch
          </Label>

          <AppSelect
            value={
              watch(
                "branchId"
              ) ?? ""
            }
            onValueChange={(
              value
            ) =>
              setValue(
                "branchId",
                value,
                {
                  shouldValidate:
                    true,
                }
              )
            }
            options={
              branchOptions
            }
          />

          <FormError
            message={
              errors.branchId
                ?.message
            }
          />
        </div>

        <div>
          <Label required>
            Role
          </Label>

          <AppSelect
            value={
              watch("role") ??
              ""
            }
            onValueChange={(
              value
            ) =>
              setValue(
                "role",
                value as CreateBranchUserFormValues["role"],
                {
                  shouldValidate:
                    true,
                }
              )
            }
            options={[
  ...BRANCH_USER_ROLE_OPTIONS,
]}
          />

          <FormError
            message={
              errors.role
                ?.message
            }
          />
        </div>
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