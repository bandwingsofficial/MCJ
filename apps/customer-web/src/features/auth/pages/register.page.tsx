// src/app/(auth)/register/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { RegisterForm } from "@/src/features/auth/components/register-form";

export default function Page() {
  return (
    <AuthLayout title="Create Account">
      <RegisterForm />
    </AuthLayout>
  );
}