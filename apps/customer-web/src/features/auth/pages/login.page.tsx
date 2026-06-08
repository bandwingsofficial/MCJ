// src/features/auth/pages/login.page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { LoginForm } from "@/src/features/auth/components/login-form";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

export function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/student");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthPageWrapper>
      <AuthCard
        title="Welcome Back"
        description="Sign in to continue"
      >
        <div className="space-y-6">
          <LoginForm />

          <div className="flex justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Forgot Password?
            </Link>

            <Link
              href="/register"
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