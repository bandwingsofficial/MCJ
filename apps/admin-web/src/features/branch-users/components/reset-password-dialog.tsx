"use client";

import {
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";

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

import {
  passwordRegex,
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/src/features/branch-users/schemas/branch-user.schema";

import { useResetPassword } from "@/src/features/branch-users/hooks/use-reset-password";

type ResetPasswordFieldName =
  keyof ResetPasswordFormValues;

interface Props {
  open: boolean;

  userId: string;

  onClose: () => void;

  onSuccess: () => void;
}

export function ResetPasswordDialog({
  open,
  userId,
  onClose,
  onSuccess,
}: Props) {
  const {
    resetPassword,
    isLoading,
  } = useResetPassword();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: {
      errors,
      touchedFields,
      dirtyFields,
      isSubmitted,
    },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(
      resetPasswordFormSchema
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const values = watch();

  const getFieldState = (
    name: ResetPasswordFieldName
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
    if (
      raw === undefined ||
      raw === null ||
      (typeof raw === "string" &&
        raw.trim() === "")
    ) {
      return "invalid";
    }

    return "valid";
  };

  const syncPasswordField = (
    name: ResetPasswordFieldName
  ) => {
    const registration =
      register(name);
    const state = getFieldState(name);

    return {
      state,
      errorMessage: errors[name]?.message,
      inputProps: {
        ...registration,
        className: validatedFieldInputClass(
          state,
          undefined,
          { passwordToggle: true, leftIcon: true }
        ),
        onBlur: (
          event: FocusEvent<HTMLInputElement>
        ) => {
          registration.onBlur(event);
          void trigger(name);
          if (name === "newPassword") {
            void trigger(
              "confirmPassword"
            );
          }
        },
        onChange: (
          event: ChangeEvent<HTMLInputElement>
        ) => {
          registration.onChange(event);
          void trigger(name);
          if (name === "newPassword") {
            void trigger(
              "confirmPassword"
            );
          }
        },
      },
    };
  };

  const newPasswordField =
    syncPasswordField("newPassword");
  const confirmPasswordField =
    syncPasswordField("confirmPassword");

  const confirmPasswordMatches =
    passwordRegex.test(
      values.newPassword
    ) &&
    values.newPassword ===
      values.confirmPassword &&
    values.confirmPassword.trim() !==
      "";

  const confirmSuccessMessage =
    confirmPasswordField.state ===
      "valid" &&
    confirmPasswordMatches
      ? "Passwords match."
      : undefined;

  const onSubmit = handleSubmit(
    async (data) => {
      const success =
        await resetPassword(
          userId,
          data.newPassword
        );

      if (!success) {
        return;
      }

      onSuccess();
      onClose();
    }
  );

  return (
    <Modal
      open={open}
      title="Reset Password"
      onClose={onClose}
    >
      <form
        key={
          open
            ? `reset-password-${userId}`
            : "reset-password-closed"
        }
        className="space-y-5"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <ValidatedField
          label="New Password"
          required
          passwordToggle
          leftIcon={<Lock className="h-4 w-4" />}
          state={newPasswordField.state}
          errorMessage={
            newPasswordField.errorMessage
          }
        >
          <PasswordInput
            {...newPasswordField.inputProps}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </ValidatedField>

        <ValidatedField
          label="Confirm Password"
          required
          passwordToggle
          leftIcon={<Lock className="h-4 w-4" />}
          state={confirmPasswordField.state}
          errorMessage={
            confirmPasswordField.errorMessage
          }
          successMessage={
            confirmSuccessMessage
          }
        >
          <PasswordInput
            {...confirmPasswordField.inputProps}
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </ValidatedField>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
