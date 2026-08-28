"use client";

import { useEffect, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, Shield, User } from "lucide-react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { PasswordInput } from "@/src/shared/components/ui/password-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  isDeletedAccountRestorable,
  isEmailConflict,
  isPhoneConflict,
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type { BranchUserItem } from "@/src/features/branch-ops/types";
import { appToast } from "@/src/shared/lib/toast";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const nameRegex = /^[A-Za-z][A-Za-z .'-]*$/;

const FIELD_ORDER = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "password",
  "role",
] as const;

const schema = z
  .object({
    mode: z.enum(["create", "edit"]),
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .min(2, "First name is required")
      .max(50, "Maximum 50 characters allowed")
      .regex(nameRegex, "Enter a valid first name"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .min(2, "Last name is required")
      .max(50, "Maximum 50 characters allowed")
      .regex(nameRegex, "Enter a valid last name"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .toLowerCase()
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .trim()
      .min(1, "Phone is required")
      .regex(phoneRegex, "Enter a valid 10-digit mobile number"),
    password: z.string(),
    role: z.enum(["FACULTY", "INTERVIEWER"], {
      error: "Select role",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.mode !== "create") return;

    if (!values.password.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
      return;
    }

    if (!passwordRegex.test(values.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message:
          "Password must contain uppercase, lowercase, number and special character",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  user?: BranchUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

function fieldState(
  touched: boolean,
  submitted: boolean,
  error?: string,
  value?: string,
): FieldVisualState {
  if (!(touched || submitted)) return "neutral";
  if (error) return "invalid";
  if (value) return "valid";
  return "neutral";
}

function focusFirstInvalid(errors: FieldErrors<FormValues>) {
  const first = FIELD_ORDER.find((name) => errors[name]);
  if (!first) return;

  const container = document.getElementById(`branch-staff-${first}`);
  container?.scrollIntoView({ block: "center", behavior: "smooth" });

  const focusable = container?.querySelector<HTMLElement>(
    "input, button, [tabindex]:not([tabindex='-1'])",
  );
  focusable?.focus();
}

export function CreateBranchStaffModal({
  open,
  user,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(user);
  const [restoreValues, setRestoreValues] = useState<FormValues | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      mode: "create",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: undefined,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      mode: user ? "edit" : "create",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      role:
        user?.role === "INTERVIEWER" || user?.role === "FACULTY"
          ? user.role
          : undefined,
    });
  }, [open, user, form]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    trigger,
    formState: { errors, touchedFields, isSubmitted, isSubmitting },
  } = form;

  const submitCreate = async (values: FormValues, confirmRestore = false) => {
    setRestoreLoading(true);
    try {
      const created = await branchOpsApi.createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role,
        confirmRestore,
      });
      appToast.success(
        created.restored
          ? "Existing deleted user restored and updated successfully."
          : "User created successfully.",
      );
      setRestoreValues(null);
      onSuccess();
      onClose();
    } catch (error) {
      if (!confirmRestore) throw error;
      const apiError = parseBranchOpsError(error);
      appToast.error(userFacingApiMessage(apiError));
    } finally {
      setRestoreLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && user) {
        await branchOpsApi.updateUser(user.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          role: values.role,
        });
        appToast.success("User updated");
        onSuccess();
        onClose();
      } else {
        await submitCreate(values, false);
      }
    } catch (error) {
      const apiError = parseBranchOpsError(error);

      if (!isEdit && isDeletedAccountRestorable(apiError)) {
        setRestoreValues(values);
        return;
      }

      if (isEmailConflict(apiError)) {
        setError(
          "email",
          {
            type: "server",
            message: apiError.message || "An active user already exists with this email.",
          },
          { shouldFocus: true },
        );
        requestAnimationFrame(() => {
          document
            .getElementById("branch-staff-email")
            ?.scrollIntoView({ block: "center", behavior: "smooth" });
          setFocus("email");
        });
        return;
      }

      if (isPhoneConflict(apiError)) {
        setError(
          "phone",
          {
            type: "server",
            message: apiError.message || "An active user already exists with this phone number.",
          },
          { shouldFocus: true },
        );
        requestAnimationFrame(() => {
          setFocus("phone");
        });
        return;
      }

      if (apiError.status === 403) {
        appToast.error(
          userFacingApiMessage(
            apiError,
            "You are not authorized to create this role.",
          ),
        );
        return;
      }

      if (apiError.status === 401) {
        appToast.error(userFacingApiMessage(apiError));
        return;
      }

      if (apiError.status === 404) {
        appToast.error(userFacingApiMessage(apiError));
        return;
      }

      if (apiError.status === 400 || apiError.status === 422) {
        const fieldErrors = apiError.errors;
        let mappedField = false;

        if (fieldErrors) {
          for (const [field, value] of Object.entries(fieldErrors)) {
            if (!FIELD_ORDER.includes(field as (typeof FIELD_ORDER)[number])) {
              continue;
            }

            const message = Array.isArray(value) ? value[0] : value;
            if (!message) continue;

            setError(field as (typeof FIELD_ORDER)[number], {
              type: "server",
              message,
            });
            mappedField = true;
          }
        }

        if (mappedField) {
          focusFirstInvalid(form.formState.errors);
          return;
        }

        appToast.error(userFacingApiMessage(apiError));
        return;
      }

      appToast.error(userFacingApiMessage(apiError));
    }
  };

  const visual = (name: keyof FormValues): FieldVisualState =>
    fieldState(
      Boolean(touchedFields[name]),
      isSubmitted,
      errors[name]?.message,
      String(watch(name) ?? ""),
    );

  return (
    <>
    <Modal
      open={open}
      title={isEdit ? "Edit User" : "Create User"}
      onClose={onClose}
      contentClassName="max-w-2xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="admin-create-btn h-11 px-5"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit, focusFirstInvalid)}
          >
            {isEdit ? "Save changes" : "Create User"}
          </Button>
        </>
      }
    >
      <form
        className="grid gap-x-4 md:grid-cols-2"
        onSubmit={handleSubmit(onSubmit, focusFirstInvalid)}
        noValidate
      >
        <ValidatedField
          htmlId="branch-staff-firstName"
          label="First Name"
          required
          leftIcon={<User className="h-4 w-4" />}
          state={visual("firstName")}
          errorMessage={errors.firstName?.message}
        >
          <Input
            placeholder="Enter first name"
            autoComplete="given-name"
            className={validatedFieldInputClass(visual("firstName"), undefined, {
              leftIcon: true,
            })}
            {...register("firstName")}
          />
        </ValidatedField>

        <ValidatedField
          htmlId="branch-staff-lastName"
          label="Last Name"
          required
          leftIcon={<User className="h-4 w-4" />}
          state={visual("lastName")}
          errorMessage={errors.lastName?.message}
        >
          <Input
            placeholder="Enter last name"
            autoComplete="family-name"
            className={validatedFieldInputClass(visual("lastName"), undefined, {
              leftIcon: true,
            })}
            {...register("lastName")}
          />
        </ValidatedField>

        <ValidatedField
          htmlId="branch-staff-email"
          label="Email"
          required
          leftIcon={<Mail className="h-4 w-4" />}
          state={visual("email")}
          errorMessage={errors.email?.message}
        >
          <Input
            type="email"
            placeholder="Enter email address"
            autoComplete="email"
            className={validatedFieldInputClass(visual("email"), undefined, {
              leftIcon: true,
            })}
            {...register("email")}
          />
        </ValidatedField>

        <ValidatedField
          htmlId="branch-staff-phone"
          label="Phone"
          required
          leftIcon={<Phone className="h-4 w-4" />}
          state={visual("phone")}
          errorMessage={errors.phone?.message}
        >
          <Input
            placeholder="Enter phone number"
            autoComplete="tel"
            inputMode="numeric"
            className={validatedFieldInputClass(visual("phone"), undefined, {
              leftIcon: true,
            })}
            {...register("phone")}
          />
        </ValidatedField>

        {!isEdit ? (
          <ValidatedField
            htmlId="branch-staff-password"
            label="Password"
            required
            passwordToggle
            leftIcon={<Lock className="h-4 w-4" />}
            state={visual("password")}
            errorMessage={errors.password?.message}
          >
            <PasswordInput
              placeholder="Enter password"
              autoComplete="new-password"
              className={validatedFieldInputClass(
                visual("password"),
                undefined,
                { leftIcon: true, passwordToggle: true },
              )}
              {...register("password")}
            />
          </ValidatedField>
        ) : null}

        <ValidatedField
          htmlId="branch-staff-role"
          label="Role"
          required
          select
          leftIcon={<Shield className="h-4 w-4" />}
          state={visual("role")}
          errorMessage={errors.role?.message}
        >
          <AppSelect
            value={watch("role") || undefined}
            placeholder="Select role"
            triggerClassName={validatedFieldInputClass(
              visual("role"),
              undefined,
              { leftIcon: true, select: true },
            )}
            onValueChange={(value) => {
              setValue("role", value as FormValues["role"], {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              });
              void trigger("role");
            }}
            options={[
              { label: "Faculty", value: "FACULTY" },
              { label: "Interviewer", value: "INTERVIEWER" },
            ]}
          />
        </ValidatedField>
      </form>
    </Modal>
    <ConfirmDialog
      open={Boolean(restoreValues)}
      title="Restore User?"
      description="An inactive account already exists with this email. Creating this user will restore and update that account."
      confirmLabel="Restore & Update"
      confirmVariant="primary"
      loading={isSubmitting || restoreLoading}
      onConfirm={() => {
        if (!restoreValues) return;
        void submitCreate(restoreValues, true);
      }}
      onCancel={() => {
        if (!isSubmitting && !restoreLoading) setRestoreValues(null);
      }}
    />
    </>
  );
}
