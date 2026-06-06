"use client";

import {
  ReactNode,
} from "react";

import { useAuthBootstrap } from "@/src/features/auth/hooks/use-auth-bootstrap";

import { Loader } from "@/src/shared/components/ui/loader";

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
    return (
      <Loader />
    );
  }

  return <>{children}</>;
}