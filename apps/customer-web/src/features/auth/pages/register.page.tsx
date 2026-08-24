"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { RegisterForm } from "@/src/features/auth/components/register-form";

function getSafeRedirect(value: string | null): string | undefined {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

function RegisterPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login";

  return (
    <AuthPageWrapper>
      <AuthCard
        title="Create Account"
        description="Register to access MCJ LMS"
      >
        <div className="space-y-6">
          <RegisterForm redirectTo={redirectTo} />

          <div className="text-center text-sm">
            <Link
              href={loginHref}
              className="text-primary hover:underline"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageWrapper>
  );
}

export function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
