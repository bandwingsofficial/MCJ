"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { PasswordInput } from "@/src/shared/components/ui/password-input";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { cn } from "@/src/shared/lib/cn";

import {
  loginSchema,
  LoginFormValues,
} from "@/src/features/auth/schemas/auth.schema";

import { useLogin } from "@/src/features/auth/hooks/use-login";
import { AuthStorage } from "@/src/features/auth/utils/auth-storage";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AdminAuthShell } from "@/src/features/auth/components/admin-auth-shell";

const authInputClass = cn(
  "h-11 w-full rounded-xl border-[#DCE8F5] bg-[#FAFAF9] pl-10 pr-3 text-sm text-[#102A56]",
  "placeholder:text-slate-400",
  "focus-visible:border-[#2563EB]/45 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#2563EB]/15",
);

export const LoginForm = () => {
  const router = useRouter();
  const { login, loading } = useLogin();
  const setStatus = useAuthStore((s) => s.setStatus);

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

      if (!response.data.requiresMfa || !response.data.mfaToken) {
        setError("root", {
          message: "Multi-factor authentication is required for admin access.",
        });
        return;
      }

      AuthStorage.setMfaToken(response.data.mfaToken);
      setStatus("MFA_REQUIRED");
      router.push("/verify-totp");
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <AdminAuthShell
      title="Welcome back"
      description="Sign in to your MCJ Academy administration account."
      footerNote="Protected by Multi-Factor Authentication"
      sideVisualSrc="/images/login-hero.png"
      sideVisualAlt="MCJ Academy admin login"
      showFormBrandLogo
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="admin-login-email"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#647A9B]"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563EB]/55"
              aria-hidden
            />
            <Input
              id="admin-login-email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              placeholder="you@mcjacademy.com"
              {...register("email")}
            />
          </div>
          <FormError message={errors.email?.message} />
        </div>

        <div>
          <label
            htmlFor="admin-login-password"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#647A9B]"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#2563EB]/55"
              aria-hidden
            />
            <PasswordInput
              id="admin-login-password"
              autoComplete="current-password"
              className={cn(authInputClass, "pr-11")}
              placeholder="Enter your password"
              {...register("password")}
            />
          </div>
          <FormError message={errors.password?.message} />
        </div>

        <FormError message={errors.root?.message} />

        <Button
          type="submit"
          loading={loading}
          className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white shadow-[0_4px_18px_rgba(37,99,235,0.28)] hover:from-[#2860D4] hover:to-[#1A3F96]"
        >
          Sign In
        </Button>
      </form>
    </AdminAuthShell>
  );
};
