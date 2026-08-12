"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Loader } from "@/src/shared/components/ui/loader";

interface Props {
  children: ReactNode;
}

/** Redirects authenticated admins away from login/MFA pages. */
export const GuestGuard = ({ children }: Props) => {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (status === "AUTHENTICATED" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [status, isAuthenticated, router]);

  if (status === "UNKNOWN" || status === "BOOTSTRAPPING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060A14]">
        <Loader />
      </div>
    );
  }

  if (status === "AUTHENTICATED" && isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060A14]">
        <Loader />
      </div>
    );
  }

  return <>{children}</>;
};
