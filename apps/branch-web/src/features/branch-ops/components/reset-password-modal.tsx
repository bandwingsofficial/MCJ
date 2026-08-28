"use client";

import { useEffect } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { PasswordInput } from "@/src/shared/components/ui/password-input";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { appToast } from "@/src/shared/lib/toast";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const schema = z
  .object({
    newPassword: z
      .string()
      .min(1, "Password is required")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character",
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .superRefine((values, ctx) => {
    if (!values.confirmPassword) return;

    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const FIELD_ORDER = ["newPassword", "confirmPassword"] as const;

interface Props {
  open: boolean;
  userId: string;
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

  const container = document.getElementById(`reset-password-${first}`);
  container?.scrollIntoView({ block: "center", behavior: "smooth" });
  container
    ?.querySelector<HTMLElement>("input")
    ?.focus();
}

export function ResetPasswordModal({
  open,
  userId,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ newPassword: "", confirmPassword: "" });
  }, [open, userId, form]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, touchedFields, isSubmitted, isSubmitting },
  } = form;

  const values = watch();
  const passwordsMatch =
    passwordRegex.test(values.newPassword) &&
    values.newPassword === values.confirmPassword &&
    values.confirmPassword.trim() !== "";

  const onSubmit = async (data: FormValues) => {
    try {
      await branchOpsApi.resetPassword(userId, data.newPassword);
      appToast.success("Password reset successfully");
      onSuccess();
      onClose();
    } catch (error) {
      const apiError = parseBranchOpsError(error);
      appToast.error(userFacingApiMessage(apiError));
    }
  };

  const visual = (name: keyof FormValues): FieldVisualState =>
    fieldState(
      Boolean(touchedFields[name]),
      isSubmitted,
      errors[name]?.message,
      values[name],
    );

  return (
    <Modal
      open={open}
      title="Reset Password"
      onClose={onClose}
      contentClassName="max-w-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="admin-create-btn h-11 px-5"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit, focusFirstInvalid)}
          >
            Reset Password
          </Button>
        </>
      }
    >
      <form
        className="grid gap-1"
        onSubmit={handleSubmit(onSubmit, focusFirstInvalid)}
        noValidate
      >
        <ValidatedField
          htmlId="reset-password-newPassword"
          label="New Password"
          required
          passwordToggle
          leftIcon={<Lock className="h-4 w-4" />}
          state={visual("newPassword")}
          errorMessage={errors.newPassword?.message}
        >
          <PasswordInput
            placeholder="Enter new password"
            autoComplete="new-password"
            className={validatedFieldInputClass(
              visual("newPassword"),
              undefined,
              { leftIcon: true, passwordToggle: true },
            )}
            {...register("newPassword", {
              onChange: () => {
                void trigger("confirmPassword");
              },
            })}
          />
        </ValidatedField>

        <ValidatedField
          htmlId="reset-password-confirmPassword"
          label="Confirm Password"
          required
          passwordToggle
          leftIcon={<Lock className="h-4 w-4" />}
          state={visual("confirmPassword")}
          errorMessage={errors.confirmPassword?.message}
          successMessage={
            visual("confirmPassword") === "valid" && passwordsMatch
              ? "Passwords match."
              : undefined
          }
        >
          <PasswordInput
            placeholder="Re-enter new password"
            autoComplete="new-password"
            className={validatedFieldInputClass(
              visual("confirmPassword"),
              undefined,
              { leftIcon: true, passwordToggle: true },
            )}
            {...register("confirmPassword")}
          />
        </ValidatedField>
      </form>
    </Modal>
  );
}
