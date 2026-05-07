// src/app/(auth)/reset-password/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { ResetPasswordForm } from "@/src/features/auth/components/reset-password-form";

export default function Page() {
  return (
    <AuthLayout title="Reset Password">
      <ResetPasswordForm />
    </AuthLayout>
  );
}