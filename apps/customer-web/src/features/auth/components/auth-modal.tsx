"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { LoginForm } from "@/src/features/auth/components/login-form";
import { RegisterForm } from "@/src/features/auth/components/register-form";
import { useAuthSessionReady } from "@/src/features/auth/hooks/use-auth-session";

export type AuthModalMode = "login" | "register";
export type AuthModalCloseMode = "back" | "home";

function getSafeRedirect(value: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

interface AuthModalProps {
  mode: AuthModalMode;
  closeMode?: AuthModalCloseMode;
}

export function AuthModal({ mode, closeMode = "back" }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const initialReferralCode = searchParams.get("ref")?.trim() ?? "";
  const { authReady, hasSession } = useAuthSessionReady();

  useEffect(() => {
    if (!authReady || !hasSession) {
      return;
    }

    router.replace(redirectTo ?? "/");
  }, [authReady, hasSession, redirectTo, router]);

  const close = useCallback(() => {
    if (closeMode === "home") {
      router.replace("/");
      return;
    }

    router.back();
  }, [closeMode, router]);

  useEffect(() => {
    if (!authReady || hasSession) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [authReady, close, hasSession]);

  function switchMode(next: AuthModalMode) {
    const params = new URLSearchParams();

    if (redirectTo) {
      params.set("redirect", redirectTo);
    }

    if (next === "register" && initialReferralCode) {
      params.set("ref", initialReferralCode);
    }

    const query = params.toString();
    const path = next === "login" ? "/login" : "/register";
    router.replace(query ? `${path}?${query}` : path, { scroll: false });
  }

  if (!authReady || hasSession) {
    return null;
  }

  const title = mode === "login" ? "Welcome Back" : "Create Account";
  const description =
    mode === "login" ? "Sign in to continue" : "Register to access MCJ LMS";

  return (
    <>
      <style>{`
        .auth-modal-backdrop {
          animation: authModalBackdropIn 180ms ease-out;
        }
        @keyframes authModalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        onClick={close}
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
            onClick={(event) => event.stopPropagation()}
          >
            <AuthCard
              title={title}
              description={description}
              variant={mode === "register" ? "wide" : "default"}
              onClose={close}
            >
              {mode === "login" ? (
                <div className="space-y-6">
                  <LoginForm redirectTo={redirectTo} />
                  <div className="flex justify-between text-sm">
                    <Link
                      href="/forgot-password"
                      className="text-primary hover:underline"
                    >
                      Forgot Password?
                    </Link>
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-primary hover:underline"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <RegisterForm
                    redirectTo={redirectTo}
                    initialReferralCode={initialReferralCode}
                  />
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary hover:underline"
                    >
                      Already have an account?
                    </button>
                  </div>
                </div>
              )}
            </AuthCard>
          </div>
        </div>
      </div>
    </>
  );
}
