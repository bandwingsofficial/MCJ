// src/features/auth/pages/register.page.tsx

import Link from "next/link";

import { AuthCard } from "@/src/features/auth/components/auth-card";
import { AuthPageWrapper } from "@/src/features/auth/components/auth-page-wrapper";
import { RegisterForm } from "@/src/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthPageWrapper>
      <AuthCard
        title="Create Account"
        description="Register to access MCJ LMS"
      >
        <div className="space-y-6">
          <RegisterForm />

          <div className="text-center text-sm">
            <Link
              href="/login"
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