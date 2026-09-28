"use client";

import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/src/providers/query-client";
import { RealtimeProvider } from "@/src/providers/realtime-provider";
import { useAuthBootstrap } from "@/src/features/auth/hooks/use-auth-bootstrap";

interface Props {
  children: ReactNode;
}

function AuthBootstrap({ children }: Props) {
  useAuthBootstrap();
  return <>{children}</>;
}

export const AppProviders = ({ children }: Props) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <RealtimeProvider />
        {children}
      </AuthBootstrap>
    </QueryClientProvider>
  );
};
