// src/core/providers/app-provider.tsx

"use client";

import {
  ReactNode,
} from "react";

import { AuthProvider } from "@/src/core/providers/auth-provider";

interface Props {
  children: ReactNode;
}

export function AppProvider({
  children,
}: Props) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}