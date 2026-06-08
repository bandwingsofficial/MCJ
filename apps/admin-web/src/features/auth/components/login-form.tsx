"use client";

import Image from "next/image";
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
  const { login, loading } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login(values);

      AuthStorage.setMfaToken(response.data.mfaToken);
      router.push("/verify-totp");
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
              src="/login.jpeg"
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
                WELCOME!
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Branch Management Administration
              </p>
            </div>

            {/* Unaltered Functional Form Core */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Email
                </Label>
                <Input
                  {...register("email")}
                  placeholder="Enter email"
                  className="h-10 border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                />
                <FormError message={errors.email?.message} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 tracking-wide">
                  Password
                </Label>
                <Input
                  type="password"
                  {...register("password")}
                  placeholder="Enter password"
                  className="h-10 border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-900 placeholder:text-slate-400 bg-white shadow-sm"
                />
                <FormError message={errors.password?.message} />
              </div>

              <FormError message={errors.root?.message} />

              <Button
                type="submit"
                loading={loading}
                className="w-full h-10 mt-2 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-semibold text-sm rounded-md transition-colors shadow-sm disabled:opacity-50"
              >
                Login
              </Button>
            </form>

            {/* Secondary Standard Footer Notice */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                MFA-Admin Panel
              </p>
            </div>

          </div>
        </div>

      </Card>
    </div>
  );
};