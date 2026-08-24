"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { LoginForm } from "@/src/features/auth/components/login-form";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

function getSafeRedirect(value: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo ?? "/student");
    }
  }, [isAuthenticated, redirectTo, router]);

  if (isAuthenticated) {
    return null;
  }

  const registerHref = redirectTo
    ? `/register?redirect=${encodeURIComponent(redirectTo)}`
    : "/register";

  return (
    <AuthPageWrapper>
      <AuthCard
        title="Welcome Back"
        description="Sign in to continue"
      >
        <div className="space-y-6">
          <LoginForm redirectTo={redirectTo} />

          <div className="flex justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot Password?
            </Link>

            <Link
              href={registerHref}
              className="text-primary hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageWrapper>
  );
}
