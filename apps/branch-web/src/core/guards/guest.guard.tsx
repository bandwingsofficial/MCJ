"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { TokenStorage } from "@/src/core/storage/token-storage";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AuthLoadingScreen } from "@/src/shared/components/ui/auth-loading";

interface Props {
  children: ReactNode;
}

export function GuestGuard({ children }: Props) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = TokenStorage.getAccessToken();

  useEffect(() => {
    if (token && user) {
      router.replace("/dashboard");
    }
  }, [router, token, user]);

  if (token && user) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
