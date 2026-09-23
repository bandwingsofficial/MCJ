import { LoginForm } from "@/src/features/auth/components/login-form";
import { GuestGuard } from "@/src/features/auth/components/guest-guard";

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="h-[100dvh] overflow-hidden">
        <LoginForm />
      </main>
    </GuestGuard>
  );
}
