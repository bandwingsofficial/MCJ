"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { z } from "zod";

import { authService } from "@/src/features/auth/services/auth.service";
import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import type { ApiErrorResponse } from "@/src/core/types/api-error.types";

const RESEND_COOLDOWN_SECONDS = 30;

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .transform((value) => value.toLowerCase()),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;
type Step = "email" | "otp" | "password" | "success";

function readRetryAfter(error: unknown): number | null {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return null;
  }

  const meta = error.response?.data?.meta as { retryAfter?: unknown } | undefined;
  return typeof meta?.retryAfter === "number" ? meta.retryAfter : null;
}

export function ForgotPasswordFlow({
  onBackToLogin,
  onCompleted,
}: {
  onBackToLogin: () => void;
  onCompleted: () => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<number | null>(null);

  const emailForm = useForm<z.input<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const clearCooldownTimer = () => {
    if (cooldownTimerRef.current != null) {
      window.clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  };

  const startCooldown = (seconds = RESEND_COOLDOWN_SECONDS) => {
    clearCooldownTimer();
    setCooldownSeconds(seconds);
    cooldownTimerRef.current = window.setInterval(() => {
      setCooldownSeconds((current) => {
        if (current <= 1) {
          clearCooldownTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  useEffect(() => clearCooldownTimer, []);

  useEffect(() => {
    if (step !== "success") {
      return;
    }

    const timer = window.setTimeout(onCompleted, 1600);
    return () => window.clearTimeout(timer);
  }, [onCompleted, step]);

  const sendOtp = async (nextEmail: string) => {
    setIsSending(true);
    setOtpError(null);
    try {
      await authService.sendPasswordResetOtp(nextEmail);
      emailForm.clearErrors("email");
      setEmail(nextEmail);
      setOtp("");
      setResetToken(null);
      setStep("otp");
      startCooldown();
    } catch (error) {
      const retryAfter = readRetryAfter(error);
      if (retryAfter) {
        startCooldown(retryAfter);
      }
      emailForm.setError("email", { message: getErrorMessage(error) });
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Enter the 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setOtpError(null);
    try {
      const result = await authService.verifyPasswordResetOtp(email, otp.trim());
      setResetToken(result.resetToken);
      setStep("password");
    } catch (error) {
      setOtpError(getErrorMessage(error));
    } finally {
      setIsVerifying(false);
    }
  };

  const resetPassword = async (values: PasswordFormValues) => {
    if (!resetToken) {
      setResetError("Reset authorization expired");
      setStep("email");
      return;
    }

    setIsResetting(true);
    setResetError(null);
    try {
      await authService.completePasswordReset({
        resetToken,
        newPassword: values.newPassword,
      });
      setStep("success");
    } catch (error) {
      setResetError(getErrorMessage(error));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <style>{`
        .mcj-fp-field { margin-bottom: 16px; }
        .mcj-fp-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: #44403C;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 7px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .mcj-fp-label .req { color: #2563D9; font-size: 14px; }
        .mcj-fp-input input {
          width: 100% !important;
          height: 44px !important;
          padding: 0 14px !important;
          background: #FAFAF9 !important;
          border: 1.5px solid #E7E5E4 !important;
          border-radius: 10px !important;
          color: #1C1917 !important;
          font-size: 14px !important;
          outline: none !important;
        }
        .mcj-fp-input input:focus {
          border-color: #2F6BE5 !important;
          background: #F4F7FE !important;
          box-shadow: 0 0 0 3px rgba(47,107,229,0.16) !important;
        }
        .mcj-fp-btn { margin-top: 8px; }
        .mcj-fp-btn button {
          width: 100% !important;
          height: 46px !important;
          border-radius: 12px !important;
          background: linear-gradient(135deg, #2F6BE5 0%, #1E49A8 100%) !important;
          color: #fff !important;
          font-weight: 700 !important;
          border: none !important;
        }
        .mcj-fp-back {
          background: none;
          border: 0;
          padding: 0;
          color: #0F2044;
          font-size: 14px;
          cursor: pointer;
        }
        .mcj-fp-back:hover { text-decoration: underline; }
      `}</style>

      {step === "success" ? (
        <p className="text-sm text-slate-700">
          Your password has been reset. You can sign in with your new password.
        </p>
      ) : null}

      {step === "email" || step === "otp" ? (
        <form
          onSubmit={emailForm.handleSubmit((values) => {
            void sendOtp((values as EmailFormValues).email);
          })}
        >
          <div className="mcj-fp-field">
            <label className="mcj-fp-label">
              Email <span className="req">*</span>
            </label>
            <div className="mcj-fp-input">
              <Input
                placeholder="Enter email"
                {...emailForm.register("email", {
                  onChange: () => {
                    if (step === "otp") {
                      setStep("email");
                      setOtp("");
                      setOtpError(null);
                      setResetToken(null);
                    }
                  },
                })}
              />
            </div>
            <FormError message={emailForm.formState.errors.email?.message} />
          </div>

          {step === "email" ? (
            <div className="mcj-fp-btn">
              <Button type="submit" loading={isSending}>
                Send OTP
              </Button>
            </div>
          ) : null}
        </form>
      ) : null}

      {step === "otp" ? (
        <div className="mt-4 space-y-2">
          <label className="mcj-fp-label">OTP</label>
          <div className="mcj-fp-input">
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              maxLength={6}
              inputMode="numeric"
            />
          </div>
          <FormError message={otpError ?? undefined} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              loading={isVerifying}
              onClick={() => void verifyOtp()}
            >
              Confirm OTP
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={cooldownSeconds > 0 || isSending}
              onClick={() => void sendOtp(email)}
            >
              {cooldownSeconds > 0
                ? `Resend OTP (${cooldownSeconds}s)`
                : "Resend OTP"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === "password" ? (
        <form onSubmit={passwordForm.handleSubmit((values) => void resetPassword(values))}>
          <div className="mcj-fp-field">
            <label className="mcj-fp-label">
              New Password <span className="req">*</span>
            </label>
            <div className="mcj-fp-input">
              <Input
                type="password"
                placeholder="Enter new password"
                {...passwordForm.register("newPassword")}
              />
            </div>
            <FormError message={passwordForm.formState.errors.newPassword?.message} />
          </div>
          <div className="mcj-fp-field">
            <label className="mcj-fp-label">
              Confirm Password <span className="req">*</span>
            </label>
            <div className="mcj-fp-input">
              <Input
                type="password"
                placeholder="Confirm new password"
                {...passwordForm.register("confirmPassword")}
              />
            </div>
            <FormError
              message={passwordForm.formState.errors.confirmPassword?.message}
            />
          </div>
          <FormError message={resetError ?? undefined} />
          <div className="mcj-fp-btn">
            <Button type="submit" loading={isResetting}>
              Reset Password
            </Button>
          </div>
        </form>
      ) : null}

      {step !== "success" ? (
        <div className="mt-4 text-center text-sm">
          <button type="button" className="mcj-fp-back" onClick={onBackToLogin}>
            Back to Login
          </button>
        </div>
      ) : null}
    </>
  );
}
