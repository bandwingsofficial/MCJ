"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { useForgotPassword } from "@/src/features/auth/hooks/use-forgot-password";

import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/src/features/auth/schemas/forgot-password.schema";

export function ForgotPasswordForm() {
  const mutation =
    useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } =
    useForm<ForgotPasswordFormValues>({
      resolver:
        zodResolver(
          forgotPasswordSchema
        ),
    });

  const onSubmit = (
    data: ForgotPasswordFormValues
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
          Email Address
        </Label>

        <Input
          placeholder="Enter email"
          {...register("email")}
        />

        <FormError
          message={
            errors.email?.message
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
        Send OTP
      </Button>
    </form>
  );
}