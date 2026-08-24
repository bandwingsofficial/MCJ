import { Suspense } from "react";

import { LoginPage } from "@/src/features/auth/pages/login.page";
import { Loader } from "@/src/shared/components/ui/loader";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}