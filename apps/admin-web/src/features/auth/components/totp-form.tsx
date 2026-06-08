"use client";

import Image from "next/image";
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
  const { setUser } = useAuth();
  const { verifyTotp, loading } = useVerifyTotp();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TotpFormValues>({
    resolver: zodResolver(totpSchema),
  });

  useEffect(() => {
    const token = AuthStorage.getMfaToken();

    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  const onSubmit = async (values: TotpFormValues) => {
    try {
      const mfaToken = AuthStorage.getMfaToken();

      if (!mfaToken) {
        return;
      }

      const response = await verifyTotp({
        mfaToken,
        totpCode: values.totpCode,
      });

      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      });

      AuthStorage.clearMfaToken();
      router.replace("/dashboard");
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8">
      <Card className="flex w-full max-w-4xl min-h-[560px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl">
        
        {/* Left Section: Minimalist, clean image display area */}
        <div className="hidden lg:flex w-1/2 bg-slate-100 border-r border-slate-200/60 items-center justify-center p-12">
          <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
            <Image
              src="/login.png"
              alt="Admin Security Workspace"
              width={320}
              height={320}
              className="object-contain opacity-95 filter drop-shadow-sm"
              priority
            />
          </div>
        </div>

        {/* Right Section: Form Context Area */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="w-full max-w-sm mx-auto space-y-7">
            
            {/* Minimal Header Structure */}
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                SECURITY VERIFICATION
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Two-Factor Authentication
              </p>
            </div>

            {/* Unaltered Functional Form Core */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Verification Code
                </Label>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  className="h-10 border-slate-200 rounded-md text-sm text-center tracking-[0.2em] font-semibold focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-normal bg-white shadow-sm"
                  {...register("totpCode")}
                />
                <FormError message={errors.totpCode?.message} />
              </div>

              <FormError message={errors.root?.message} />

              <Button
                type="submit"
                loading={loading}
                className="w-full h-10 mt-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold text-sm rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                Verify
              </Button>
            </form>
          </div>
        </div>

      </Card>
    </div>
  );
};