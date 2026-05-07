// src/app/(auth)/login/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { LoginForm } from "@/src/features/auth/components/login-form";

export default function Page() {
  return (
    <AuthLayout title="Login">
      <LoginForm />
    </AuthLayout>
  );
}