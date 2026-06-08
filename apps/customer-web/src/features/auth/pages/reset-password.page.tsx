// src/features/auth/pages/reset-password.page.tsx

import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { ResetPasswordForm } from "@/src/features/auth/components/reset-password-form";

export function ResetPasswordPage() {
  return (
    <AuthPageWrapper>
      <AuthCard
        title="Reset Password"
        description="Enter OTP and new password"
      >
        <div className="space-y-6">
          <ResetPasswordForm />

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