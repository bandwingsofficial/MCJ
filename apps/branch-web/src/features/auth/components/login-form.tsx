"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/login.schema";

import { useLogin } from "@/src/features/auth/hooks/use-login";

import { Button } from "@/src/shared/components/ui/button";

import { Input } from "@/src/shared/components/ui/input";

import { Label } from "@/src/shared/components/ui/label";

export function LoginForm() {
  const {
    login,
    isLoading,
  } = useLogin();

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(
        loginSchema
      ),

    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (
  values: LoginFormValues
) => {
  try {
    await login(values);
  } catch {
    // already handled in hook
  }
};

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="identifier">
          Email
        </Label>

        <Input
          id="identifier"
          placeholder="Enter email"
          autoComplete="email"
          {...register(
            "identifier"
          )}
        />

        {errors.identifier && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors
                .identifier
                .message
            }
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">
          Password
        </Label>

        <Input
          id="password"
          type="password"
          placeholder="Enter password"
          autoComplete="current-password"
          {...register(
            "password"
          )}
        />

        {errors.password && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors
                .password
                .message
            }
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          isLoading
        }
        className="w-full"
      >
        {isLoading
          ? "Signing In..."
          : "Sign In"}
      </Button>
    </form>
  );
}