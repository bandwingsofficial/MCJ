"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Loader } from "@/src/shared/components/ui/loader";

interface Props {
  children: ReactNode;
}

export const AuthGuard = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === "UNKNOWN" || status === "BOOTSTRAPPING" || status === "REFRESHING") {
      return;
    }

    if (!isAuthenticated || status === "UNAUTHENTICATED") {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/dashboard")}`);
      return;
    }

    if (user && user.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [status, isAuthenticated, user, router, pathname]);

  // Keep the current page mounted during silent token refresh so in-flight
  // forms/modals (e.g. Create Student) are not unmounted mid-submit.
  if (status === "UNKNOWN" || status === "BOOTSTRAPPING") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader />
          <p className="text-sm">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (status === "REFRESHING" && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader />
          <p className="text-sm">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || status === "UNAUTHENTICATED") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader />
          <p className="text-sm">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader />
          <p className="text-sm">Redirecting to login…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
