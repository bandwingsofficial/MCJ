"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

import { useLogin } from "@/src/features/auth/hooks/use-login";

import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/login.schema";
import { z } from "zod";

export function LoginForm() {
  const loginMutation =
    useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof loginSchema>>({
    resolver:
      zodResolver(loginSchema),
  });

  const onSubmit = (
    data: LoginFormValues
  ) => {
    loginMutation.mutate(data);
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
          placeholder="Enter email"
          {...register(
            "identifier"
          )}
        />

        <FormError
          message={
            errors.identifier
              ?.message
          }
        />
      </div>

      <div>
        <Label required>
          Password
        </Label>

        <Input
          type="password"
          placeholder="Enter password"
          {...register(
            "password"
          )}
        />

        <FormError
          message={
            errors.password
              ?.message
          }
        />
      </div>

      <Button
        type="submit"
        loading={
          loginMutation.isPending
        }
        className="w-full"
      >
        Login
      </Button>
    </form>
  );
}