// src/app/(auth)/forgot-password/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { ForgotPasswordForm } from "@/src/features/auth/components/forgot-password-form";

export default function Page() {
  return (
    <AuthLayout title="Forgot Password">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}