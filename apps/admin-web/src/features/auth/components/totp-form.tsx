"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { cn } from "@/src/shared/lib/cn";

import {
  totpSchema,
  TotpFormValues,
} from "@/src/features/auth/schemas/auth.schema";

import { useVerifyTotp } from "@/src/features/auth/hooks/use-verify-totp";
import { AuthStorage } from "@/src/features/auth/utils/auth-storage";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { authService } from "@/src/features/auth/services/auth.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { AdminAuthShell } from "@/src/features/auth/components/admin-auth-shell";

const authInputClass = cn(
  "h-11 w-full rounded-xl border-[#DCE8F5] bg-[#FAFAF9] pl-10 pr-3 text-sm text-[#102A56]",
  "placeholder:text-slate-400",
  "focus-visible:border-[#2563EB]/45 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#2563EB]/15",
);

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
      router.replace("/login");
    }
  }, [router]);

  const onSubmit = async (values: TotpFormValues) => {
    try {
      const mfaToken = AuthStorage.getMfaToken();

      if (!mfaToken) {
        router.replace("/login");
        return;
      }

      const response = await verifyTotp({
        mfaToken,
        totpCode: values.totpCode,
        clientType: "ADMIN_WEB",
      });

      let sessionId = response.data.sessionId;

      try {
        const profile = await authService.getProfile();
        sessionId = profile.data.sessionId ?? sessionId;
      } catch {
        // Profile fetch is best-effort; tokens are already stored
      }

      setUser({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        sessionId,
        mfaEnabled: true,
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
    <AdminAuthShell
      title="Verify your identity"
      description="Enter the 6-digit code from your authenticator app to complete sign-in."
      footerNote="Protected by Multi-Factor Authentication"
      sideVisualSrc="/images/login-hero.png"
      sideVisualAlt="MCJ Academy admin verification"
      showFormBrandLogo
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="admin-totp-code"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#647A9B]"
          >
            Verification code
          </label>
          <div className="relative">
            <KeyRound
              className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#2563EB]/55"
              aria-hidden
            />
                    <Input
              id="admin-totp-code"
                      inputMode="numeric"
              autoComplete="one-time-code"
                      maxLength={6}
              className={authInputClass}
                      placeholder="Enter 6-digit code"
                      {...register("totpCode")}
                    />
                  </div>
                  <FormError message={errors.totpCode?.message} />
                </div>

                <FormError message={errors.root?.message} />

        <Button
          type="submit"
          loading={loading}
          className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] text-sm font-semibold text-white shadow-[0_4px_18px_rgba(37,99,235,0.28)] hover:from-[#2860D4] hover:to-[#1A3F96]"
        >
          Verify and continue
                  </Button>

        <div className="text-center">
                  <button
                    type="button"
            className="text-sm font-medium text-[#2563EB] underline-offset-2 transition-colors hover:text-[#1D4ED8] hover:underline"
                    onClick={() => {
                      AuthStorage.clearMfaToken();
                      router.replace("/login");
                    }}
                  >
                    Back to login
                  </button>
                </div>
              </form>
    </AdminAuthShell>
  );
};
