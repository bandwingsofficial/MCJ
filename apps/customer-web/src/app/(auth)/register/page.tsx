// src/app/(auth)/register/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { RegisterForm } from "@/src/features/auth/components/register-form";
import Link from "next/link";

export default function Page() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your journey with us."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}