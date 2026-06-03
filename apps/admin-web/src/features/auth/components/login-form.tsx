"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";

import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/auth.schema";

import { useLogin } from "@/src/features/auth/hooks/use-login";

import { AuthStorage } from "@/src/features/auth/utils/auth-storage";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

export const LoginForm = () => {
  const router = useRouter();

  const { login, loading } =
    useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver:
      zodResolver(loginSchema),
  });

  const onSubmit = async (
    values: LoginFormValues
  ) => {
    try {
      const response =
        await login(values);

      AuthStorage.setMfaToken(
        response.data.mfaToken
      );

      router.push(
        "/verify-totp"
      );
    } catch (error) {
      setError("root", {
        message:
          getErrorMessage(error),
      });
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-5"
      >
        <div>
          <Label>Email</Label>

          <Input
            {...register("email")}
            placeholder="Enter email"
          />

          <FormError
            message={
              errors.email?.message
            }
          />
        </div>

        <div>
          <Label>Password</Label>

          <Input
            type="password"
            {...register(
              "password"
            )}
            placeholder="Enter password"
          />

          <FormError
            message={
              errors.password
                ?.message
            }
          />
        </div>

        <FormError
          message={
            errors.root?.message
          }
        />

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Login
        </Button>
      </form>
    </Card>
  );
};