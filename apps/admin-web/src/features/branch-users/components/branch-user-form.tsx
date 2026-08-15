"use client";

import {
  useEffect,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";

import { PasswordInput } from "@/src/shared/components/ui/password-input";

import { Button } from "@/src/shared/components/ui/button";

import { Label } from "@/src/shared/components/ui/label";

import { FormError } from "@/src/shared/components/ui/form-error";

import { AppSelect } from "@/src/shared/components/ui/select";

import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import {
  createBranchUserFormSchema,
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

type CreateSyncFieldName = Exclude<
  keyof CreateBranchUserFormValues,
  "branchId" | "role" | "permissions"
>;

type CreatePasswordFieldName =
  | "password"
  | "confirmPassword";

interface BranchUserFormProps {
  defaultValues?: Partial<BranchUserFormValues>;

  branchOptions?: BranchOption[];

  fixedBranch?: {
    id: string;
    label: string;
  };

  isSubmitting: boolean;

  submitLabel: string;

  isEdit?: boolean;

  onSubmit: (
    values: BranchUserFormValues
  ) => Promise<void>;
}

export function BranchUserForm({
  defaultValues,
  branchOptions = [],
  fixedBranch,
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
    setError,
    trigger,
    watch,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<BranchUserFormValues>({
    resolver: zodResolver(
      isEdit
        ? updateBranchUserSchema
        : createBranchUserFormSchema
    ) as any,
    mode: isEdit ? "onSubmit" : "onTouched",
    reValidateMode: isEdit ? "onSubmit" : "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "BRANCH_MANAGER",
      branchId: fixedBranch?.id ?? "",
      permissions: [],
      ...(isEdit
        ? {}
        : {
            password: "",
            confirmPassword: "",
          }),
      ...defaultValues,
    } as any,
  });

  const values = watch();

  useEffect(() => {
    reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "BRANCH_MANAGER",
      branchId: fixedBranch?.id ?? "",
      permissions: [],
      ...(isEdit
        ? {}
        : {
            password: "",
            confirmPassword: "",
          }),
      ...defaultValues,
    } as any);
  }, [
    defaultValues,
    fixedBranch?.id,
    isEdit,
    reset,
  ]);

  useEffect(() => {
    if (fixedBranch?.id) {
      setValue("branchId", fixedBranch.id, {
        shouldValidate: false,
      });
    }
  }, [fixedBranch?.id, setValue]);

  useEffect(() => {
    setValue(
      "permissions" as any,
      [],
      {
        shouldValidate: false,
      }
    );
  }, [setValue]);

  const applyBackendError = (error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "";
    const lower = message.toLowerCase();

    if (
      lower.includes("email") &&
      (lower.includes("already") ||
        lower.includes("exist") ||
        lower.includes("registered"))
    ) {
      setError("email", {
        type: "server",
        message:
          message.trim() ||
          "Email is already registered.",
      });
      return;
    }

    if (
      lower.includes("phone") &&
      (lower.includes("already") ||
        lower.includes("exist"))
    ) {
      setError("phone", {
        type: "server",
        message:
          message.trim() ||
          "Phone number is already registered.",
      });
    }
  };

  const getSyncFieldState = (
    name: CreateSyncFieldName
  ): FieldVisualState => {
    const createTouched = touchedFields as Partial<
      Record<CreateSyncFieldName, boolean>
    >;
    const createDirty = dirtyFields as Partial<
      Record<CreateSyncFieldName, boolean>
    >;
    const createErrors =
      errors as import("react-hook-form").FieldErrors<CreateBranchUserFormValues>;
    const createValues =
      values as CreateBranchUserFormValues;

    const interacted =
      Boolean(createTouched[name]) ||
      Boolean(createDirty[name]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (createErrors[name]) {
      return "invalid";
    }

    const raw = createValues[name];
    if (raw === undefined || raw === null) {
      return "neutral";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      return "invalid";
    }

    return "valid";
  };

  const syncField = (name: CreateSyncFieldName) => {
    const registration = register(name);
    const state = getSyncFieldState(name);
    const createErrors =
      errors as import("react-hook-form").FieldErrors<CreateBranchUserFormValues>;

    return {
      state,
      errorMessage: createErrors[name]?.message,
      inputProps: {
        ...registration,
        className: validatedFieldInputClass(state),
        onBlur: (
          event: FocusEvent<HTMLInputElement>
        ) => {
          registration.onBlur(event);
          void trigger(name);
        },
        onChange: (
          event: ChangeEvent<HTMLInputElement>
        ) => {
          registration.onChange(event);
          void trigger(name);
        },
      },
    };
  };

  const syncPasswordField = (
    name: CreatePasswordFieldName
  ) => {
    const registration = register(name);
    const state = getSyncFieldState(name);
    const createErrors =
      errors as import("react-hook-form").FieldErrors<CreateBranchUserFormValues>;

    return {
      state,
      errorMessage: createErrors[name]?.message,
      inputProps: {
        ...registration,
        className: validatedFieldInputClass(
          state,
          undefined,
          { passwordToggle: true }
        ),
        onBlur: (
          event: FocusEvent<HTMLInputElement>
        ) => {
          registration.onBlur(event);
          void trigger(name);
          if (name === "password") {
            void trigger("confirmPassword");
          }
        },
        onChange: (
          event: ChangeEvent<HTMLInputElement>
        ) => {
          registration.onChange(event);
          void trigger(name);
          if (name === "password") {
            void trigger("confirmPassword");
          }
        },
      },
    };
  };

  const getSelectFieldState = (
    name: "role" | "branchId"
  ): FieldVisualState => {
    const interacted =
      Boolean(touchedFields[name]) ||
      Boolean(dirtyFields[name]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    const raw = values[name];
    if (!raw || (typeof raw === "string" && raw.trim() === "")) {
      return "invalid";
    }

    return "valid";
  };

  const submitHandler = handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      if (!isEdit) {
        applyBackendError(error);
      }
    }
  });

  if (isEdit) {
    return (
      <form
        onSubmit={(event) => {
          void submitHandler(event);
        }}
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

          <div>
            <Label required>
              Branch
            </Label>

            {fixedBranch ? (
              <Input
                value={fixedBranch.label}
                readOnly
                disabled
              />
            ) : (
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
            )}

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
          className="mt-4"
        >
          {submitLabel}
        </Button>
      </form>
    );
  }

  const firstNameField = syncField("firstName");
  const lastNameField = syncField("lastName");
  const emailField = syncField("email");
  const phoneField = syncField("phone");
  const passwordField =
    syncPasswordField("password");
  const confirmPasswordField =
    syncPasswordField("confirmPassword");
  const roleState = getSelectFieldState("role");
  const branchState = fixedBranch
    ? "neutral"
    : getSelectFieldState("branchId");

  return (
    <form
      onSubmit={(event) => {
        void submitHandler(event);
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ValidatedField
          label="First Name"
          required
          state={firstNameField.state}
          errorMessage={firstNameField.errorMessage}
        >
          <Input
            {...firstNameField.inputProps}
            placeholder="First Name"
          />
        </ValidatedField>

        <ValidatedField
          label="Last Name"
          required
          state={lastNameField.state}
          errorMessage={lastNameField.errorMessage}
        >
          <Input
            {...lastNameField.inputProps}
            placeholder="Last Name"
          />
        </ValidatedField>

        <ValidatedField
          label="Email"
          required
          state={emailField.state}
          errorMessage={emailField.errorMessage}
        >
          <Input
            {...emailField.inputProps}
            placeholder="Email"
            type="email"
            autoComplete="email"
          />
        </ValidatedField>

        <ValidatedField
          label="Phone"
          required
          state={phoneField.state}
          errorMessage={phoneField.errorMessage}
        >
          <Input
            {...phoneField.inputProps}
            placeholder="Phone"
            type="tel"
            autoComplete="tel"
          />
        </ValidatedField>

        <ValidatedField
          label="Password"
          required
          passwordToggle
          state={passwordField.state}
          errorMessage={passwordField.errorMessage}
        >
          <PasswordInput
            {...passwordField.inputProps}
            placeholder="Password"
            autoComplete="new-password"
          />
        </ValidatedField>

        <ValidatedField
          label="Confirm Password"
          required
          passwordToggle
          state={confirmPasswordField.state}
          errorMessage={
            confirmPasswordField.errorMessage
          }
        >
          <PasswordInput
            {...confirmPasswordField.inputProps}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </ValidatedField>

        {fixedBranch ? (
          <div className="min-w-0">
            <Label>Branch</Label>
            <Input
              value={fixedBranch.label}
              readOnly
              disabled
            />
            <div className="mt-1 min-h-[1.25rem]" />
          </div>
        ) : (
          <div className="min-w-0">
            <Label required>Branch</Label>
            <AppSelect
              value={watch("branchId") ?? ""}
              triggerClassName={validatedFieldInputClass(
                branchState
              )}
              onValueChange={(value) => {
                setValue("branchId", value, {
                  shouldValidate: true,
                  shouldTouch: true,
                  shouldDirty: true,
                });
                void trigger("branchId");
              }}
              options={branchOptions}
            />
            <div className="mt-1 min-h-[1.25rem]">
              {branchState === "invalid" &&
              errors.branchId?.message ? (
                <p
                  role="alert"
                  className="text-sm text-red-500"
                >
                  {errors.branchId.message}
                </p>
              ) : null}
            </div>
          </div>
        )}

        <div className="min-w-0">
          <Label required>Role</Label>
          <AppSelect
            value={watch("role") ?? ""}
            triggerClassName={validatedFieldInputClass(
              roleState
            )}
            onValueChange={(value) => {
              setValue(
                "role",
                value as CreateBranchUserFormValues["role"],
                {
                  shouldValidate: true,
                  shouldTouch: true,
                  shouldDirty: true,
                }
              );
              void trigger("role");
            }}
            options={[...BRANCH_USER_ROLE_OPTIONS]}
          />
          <div className="mt-1 min-h-[1.25rem]">
            {roleState === "invalid" &&
            errors.role?.message ? (
              <p
                role="alert"
                className="text-sm text-red-500"
              >
                {errors.role.message}
              </p>
            ) : null}
          </div>
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
