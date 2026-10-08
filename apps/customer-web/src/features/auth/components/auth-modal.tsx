"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { ForgotPasswordFlow } from "@/src/features/auth/components/forgot-password-flow";
import { LoginForm } from "@/src/features/auth/components/login-form";
import { RegisterForm } from "@/src/features/auth/components/register-form";
import { useAuthSessionReady } from "@/src/features/auth/hooks/use-auth-session";
import type { AuthModalMode } from "@/src/features/auth/components/auth-modal-context";

export type { AuthModalMode } from "@/src/features/auth/components/auth-modal-context";
export type AuthModalCloseMode = "back" | "home";

interface AuthModalProps {
  mode: AuthModalMode;
  redirectTo?: string;
  initialReferralCode?: string;
  onClose: () => void;
  onHide: () => void;
  onSwitchMode: (mode: AuthModalMode) => void;
}

export function AuthModal({
  mode,
  redirectTo,
  initialReferralCode = "",
  onClose,
  onSwitchMode,
}: AuthModalProps) {
  const router = useRouter();
  const { authReady, hasSession } = useAuthSessionReady();

  useEffect(() => {
    if (!authReady || !hasSession) {
      return;
    }

    router.replace(redirectTo ?? "/");
  }, [authReady, hasSession, redirectTo, router]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!authReady || hasSession) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [authReady, hasSession]);

  if (!authReady || hasSession) {
    return null;
  }

  const title =
    mode === "login"
      ? "Welcome Back"
      : mode === "register"
        ? "Create Account"
        : "Forgot Password";

  const description =
    mode === "login"
      ? "Sign in to continue"
      : mode === "register"
        ? "Register to access MCJ LMS"
        : "Reset your password";

  return (
    <>
      <style>{`
        .auth-modal-backdrop {
          animation: authModalBackdropIn 180ms ease-out;
        }

        @keyframes authModalBackdropIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-modal-backdrop,
          .mcj-auth-card-shell {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="auth-modal-backdrop fixed inset-0 z-[90] overflow-y-auto bg-black/70 p-4 sm:p-6"
        role="presentation"
      >
        <div className="flex min-h-full items-center justify-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={
              mode === "register"
                ? "my-auto w-full max-w-[820px]"
                : "my-auto w-full max-w-[440px]"
            }
          >
            <AuthCard
              title={title}
              description={description}
              variant={mode === "register" ? "wide" : "default"}
              onClose={close}
            >
              {mode === "login" ? (
                <div className="space-y-6">
                  <LoginForm
                    redirectTo={redirectTo}
                    onForgotPassword={() =>
                      onSwitchMode("forgot-password")
                    }
                  />

                  <div className="flex justify-between text-sm">
                    <button
                      type="button"
                      onClick={() =>
                        onSwitchMode("forgot-password")
                      }
                      className="text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSwitchMode("register")
                      }
                      className="text-primary hover:underline"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              ) : mode === "register" ? (
                <div className="space-y-6">
                  <RegisterForm
                    redirectTo={redirectTo}
                    initialReferralCode={initialReferralCode}
                  />

                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => onSwitchMode("login")}
                      className="text-primary hover:underline"
                    >
                      Already have an account?
                    </button>
                  </div>
                </div>
              ) : (
                <ForgotPasswordFlow
                  onBackToLogin={() =>
                    onSwitchMode("login")
                  }
                  onCompleted={onClose}
                />
              )}
            </AuthCard>
          </div>
        </div>
      </div>
    </>
  );
}