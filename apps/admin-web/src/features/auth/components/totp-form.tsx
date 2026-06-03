"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Card } from "@/src/shared/components/ui/card";

import { Input } from "@/src/shared/components/ui/input";

import { Label } from "@/src/shared/components/ui/label";

import { Button } from "@/src/shared/components/ui/button";

import { FormError } from "@/src/shared/components/ui/form-error";

import {
  totpSchema,
  TotpFormValues,
} from "@/src/features/auth/schemas/auth.schema";

import { useVerifyTotp } from "@/src/features/auth/hooks/use-verify-totp";

import { AuthStorage } from "@/src/features/auth/utils/auth-storage";

import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export const TotpForm = () => {
  const router = useRouter();

  const { setUser } =
    useAuth();

  const {
    verifyTotp,
    loading,
  } = useVerifyTotp();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TotpFormValues>({
    resolver:
      zodResolver(totpSchema),
  });

  useEffect(() => {
    const token =
      AuthStorage.getMfaToken();

    if (!token) {
      router.replace(
        "/admin/login"
      );
    }
  }, [router]);

  const onSubmit = async (
    values: TotpFormValues
  ) => {
    try {
      const mfaToken =
        AuthStorage.getMfaToken();

      if (!mfaToken) {
        return;
      }

      const response =
        await verifyTotp({
          mfaToken,
          totpCode:
            values.totpCode,
        });

      setUser({
        id: response.data.id,
        email:
          response.data.email,
        name:
          response.data.name,
        role:
          response.data.role,
      });

      AuthStorage.clearMfaToken();

      router.replace(
        "/dashboard"
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
          <Label>
            Verification Code
          </Label>

          <Input
  inputMode="numeric"
  maxLength={6}
  {...register("totpCode")}
/>

          <FormError
            message={
              errors.totpCode
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
          Verify
        </Button>
      </form>
    </Card>
  );
};