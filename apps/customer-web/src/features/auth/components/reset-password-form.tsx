"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { useResetPassword } from "@/src/features/auth/hooks/use-reset-password";

import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/src/features/auth/schemas/reset-password.schema";

export function ResetPasswordForm() {
  const mutation =
    useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } =
    useForm<ResetPasswordFormValues>({
      resolver:
        zodResolver(
          resetPasswordSchema
        ),
    });

  const onSubmit = (
    data: ResetPasswordFormValues
  ) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-5"
    >
      <div>
        <Label required>
          Email
        </Label>

        <Input
          {...register("email")}
        />

        <FormError
          message={
            errors.email?.message
          }
        />
      </div>

      <div>
        <Label required>
          OTP
        </Label>

        <Input
          {...register("otp")}
        />

        <FormError
          message={
            errors.otp?.message
          }
        />
      </div>

      <div>
        <Label required>
          New Password
        </Label>

        <Input
          type="password"
          {...register(
            "newPassword"
          )}
        />

        <FormError
          message={
            errors.newPassword
              ?.message
          }
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={
          mutation.isPending
        }
      >
        Reset Password
      </Button>
    </form>
  );
}