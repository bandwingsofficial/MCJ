import { Suspense } from "react";

import { AuthHandoffPage } from "@/src/features/auth/pages/auth-handoff.page";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      }
    >
      <AuthHandoffPage />
    </Suspense>
  );
}
