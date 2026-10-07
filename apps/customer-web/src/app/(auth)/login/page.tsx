import { Suspense } from "react";

import { AuthDirectAccessFrame } from "@/src/features/auth/components/auth-direct-access-frame";
import { LoginPage } from "@/src/features/auth/pages/login.page";
import { Loader } from "@/src/shared/components/ui/loader";

export default function Page() {
  return (
    <AuthDirectAccessFrame>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        }
      >
        <LoginPage closeMode="home" />
      </Suspense>
    </AuthDirectAccessFrame>
  );
}
