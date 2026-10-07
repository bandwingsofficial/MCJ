import { AuthDirectAccessFrame } from "@/src/features/auth/components/auth-direct-access-frame";
import { RegisterPage } from "@/src/features/auth/pages/register.page";

export default function Page() {
  return (
    <AuthDirectAccessFrame>
      <RegisterPage closeMode="home" />
    </AuthDirectAccessFrame>
  );
}
