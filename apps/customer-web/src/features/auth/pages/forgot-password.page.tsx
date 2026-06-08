// src/features/auth/pages/forgot-password.page.tsx

import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { ForgotPasswordForm } from "@/src/features/auth/components/forgot-password-form";

export function ForgotPasswordPage() {
  return (
    <AuthPageWrapper>
      <AuthCard
        title="Forgot Password"
        description="Enter your email to receive OTP"
      >
        <div className="space-y-6">
          <ForgotPasswordForm />

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="text-primary hover:underline"
            >
              Back To Login
            </Link>
          </div>
        </div>
      </AuthCard>
    </AuthPageWrapper>
  );
}