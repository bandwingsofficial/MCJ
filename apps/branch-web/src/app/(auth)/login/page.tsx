import { LoginForm } from "@/src/features/auth/components/login-form";
import { AuthLayout } from "@/src/features/auth/layouts/auth-layout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}