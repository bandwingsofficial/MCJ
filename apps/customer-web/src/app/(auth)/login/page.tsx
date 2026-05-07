// src/app/(auth)/login/page.tsx

import { AuthLayout } from "@/src/features/auth/components/auth-layout";
import { LoginForm } from "@/src/features/auth/components/login-form";
import Link from "next/link";

export default function Page() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Welcome back! Please login to continue."
      footer={
        <>
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}