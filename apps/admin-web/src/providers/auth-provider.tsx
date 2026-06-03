"use client";

import { ReactNode } from "react";

import { useAuthBootstrap } from "@/src/features/auth/hooks/use-auth-bootstrap";

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: Props) => {
  useAuthBootstrap();

  return <>{children}</>;
};