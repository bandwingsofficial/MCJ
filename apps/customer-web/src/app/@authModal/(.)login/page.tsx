import { Suspense } from "react";

import { LoginPage } from "@/src/features/auth/pages/login.page";

export default function InterceptedLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPage closeMode="back" />
    </Suspense>
  );
}
