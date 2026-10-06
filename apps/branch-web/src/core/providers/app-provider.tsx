// src/core/providers/app-provider.tsx

"use client";

import {
  ReactNode,
} from "react";

import { AuthProvider } from "@/src/core/providers/auth-provider";
import { DocumentTitleProvider } from "@/src/shared/document-title/document-title-provider";

interface Props {
  children: ReactNode;
}

export function AppProvider({
  children,
}: Props) {
  return (
    <AuthProvider>
      <DocumentTitleProvider>{children}</DocumentTitleProvider>
    </AuthProvider>
  );
}