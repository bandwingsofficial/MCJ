"use client";

import { useMe } from "@/src/domains/auth/hooks/useMe";

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useMe(); // 🔥 auto fetch user from cookies

  return <>{children}</>;
};