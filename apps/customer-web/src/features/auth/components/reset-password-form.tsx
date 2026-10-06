"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { authService } from "@/src/features/auth/services/auth.service";
import { useResetPassword } from "@/src/features/auth/hooks/use-reset-password";
import {
  resetPasswordSchema,
  ResetPasswordFormValues,
} from "@/src/features/auth/schemas/reset-password.schema";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const mutation = useResetPassword(token);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token.trim()) {
      setTokenValid(false);
      return;
    }

    let cancelled = false;
    void authService
      .validatePasswordResetToken(token)
      .then((result) => {
        if (!cancelled) {
          setTokenValid(result.valid);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTokenValid(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutation.mutate({ newPassword: data.newPassword });
  };

  if (tokenValid === null) {
    return <p className="text-sm text-[#64748B]">Checking reset link…</p>;
  }

  if (!tokenValid) {
    return (
      <p className="text-sm text-rose-700">
        This password reset link is invalid or has expired. Request a new link
        from the forgot password page.
      </p>
    );
  }

  return (
    <>
      <style>{`
        .mcj-field { margin-bottom: 15px; }
        .mcj-label {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 7px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-label .req { color: #F59E0B; font-size: 14px; }
        .mcj-input-wrap { position: relative; }
        .mcj-input-wrap input {
          width: 100% !important;
          height: 44px !important;
          padding: 0 14px !important;
          background: #FAFAF9 !important;
          border: 1.5px solid #E7E5E4 !important;
          border-radius: 10px !important;
        }
        .mcj-btn-wrap { margin-top: 22px; }
      `}</style>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mcj-field">
          <label className="mcj-label">
            New Password <span className="req">*</span>
          </label>
          <div className="mcj-input-wrap">
            <Input
              type="password"
              placeholder="Create a new password"
              {...register("newPassword")}
            />
          </div>
          <FormError message={errors.newPassword?.message} />
        </div>

        <div className="mcj-field">
          <label className="mcj-label">
            Confirm Password <span className="req">*</span>
          </label>
          <div className="mcj-input-wrap">
            <Input
              type="password"
              placeholder="Confirm your new password"
              {...register("confirmPassword")}
            />
          </div>
          <FormError message={errors.confirmPassword?.message} />
        </div>

        <div className="mcj-btn-wrap">
          <Button type="submit" loading={mutation.isPending}>
            Reset Password
          </Button>
        </div>
      </form>
    </>
  );
}
