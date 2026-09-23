import { TotpForm } from "@/src/features/auth/components/totp-form";
import { GuestGuard } from "@/src/features/auth/components/guest-guard";

export default function VerifyTotpPage() {
  return (
    <GuestGuard>
      <main className="h-[100dvh] overflow-hidden">
        <TotpForm />
      </main>
    </GuestGuard>
  );
}
