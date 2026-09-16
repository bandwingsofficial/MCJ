"use client";

// src/core/providers/query-provider.tsx

import { ReactNode } from "react";

import {
  QueryClientProvider,
} from "@tanstack/react-query";

import { queryClient } from "@/src/shared/lib/react-query";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({
  children,
}: QueryProviderProps) {
  return (
    <QueryClientProvider
      client={queryClient}
    >
      {children}
    </QueryClientProvider>
  );
}