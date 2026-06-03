import { TotpForm } from "@/src/features/auth/components/totp-form";

export default function VerifyTotpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <TotpForm />
    </main>
  );
}