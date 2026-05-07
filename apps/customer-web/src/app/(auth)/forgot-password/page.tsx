// src/app/(auth)/forgot-password/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { ForgotPasswordForm } from "@/src/features/auth/components/forgot-password-form";
import Link from "next/link";

export default function Page() {
  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive OTP."
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}