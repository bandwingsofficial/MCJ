import { TotpForm } from "@/src/features/auth/components/totp-form";
import { GuestGuard } from "@/src/features/auth/components/guest-guard";

export default function VerifyTotpPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen">
        <TotpForm />
      </main>
    </GuestGuard>
  );
}
