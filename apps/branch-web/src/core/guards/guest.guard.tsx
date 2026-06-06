"use client";

import {
  ReactNode,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import { TokenStorage } from "@/src/core/storage/token-storage";

interface Props {
  children: ReactNode;
}

export function GuestGuard({
  children,
}: Props) {
  const router =
    useRouter();

  useEffect(() => {
    const token =
      TokenStorage.getAccessToken();

    if (token) {
      router.replace(
        "/dashboard"
      );
    }
  }, [router]);

  return <>{children}</>;
}