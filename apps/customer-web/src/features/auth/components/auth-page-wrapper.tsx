// src/features/auth/components/auth-page-wrapper.tsx

import { ReactNode } from "react";

interface AuthPageWrapperProps {
  children: ReactNode;
}

export function AuthPageWrapper({
  children,
}: AuthPageWrapperProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {children}
    </div>
  );
}