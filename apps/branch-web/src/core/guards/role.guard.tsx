"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isPathAllowed } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AuthLoadingScreen } from "@/src/shared/components/ui/auth-loading";

interface Props {
  children: ReactNode;
}

export function RoleGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const allowed = isPathAllowed(user?.role, pathname);

  useEffect(() => {
    if (user && !allowed) {
      router.replace("/forbidden");
    }
  }, [allowed, router, user]);

  if (!user) {
    return <AuthLoadingScreen />;
  }

  if (!allowed) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
