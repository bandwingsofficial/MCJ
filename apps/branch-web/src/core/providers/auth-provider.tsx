"use client";

import {
  ReactNode,
} from "react";

import { useAuthBootstrap } from "@/src/features/auth/hooks/use-auth-bootstrap";

import { AuthLoadingScreen } from "@/src/shared/components/ui/auth-loading";

interface Props {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: Props) {
  const {
    isLoading,
  } = useAuthBootstrap();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}