"use client";

import { Suspense } from "react";

import {
  AuthModal,
  type AuthModalCloseMode,
} from "@/src/features/auth/components/auth-modal";

function RegisterPageContent({
  closeMode,
}: {
  closeMode: AuthModalCloseMode;
}) {
  return <AuthModal mode="register" closeMode={closeMode} />;
}

export function RegisterPage({
  closeMode = "back",
}: {
  closeMode?: AuthModalCloseMode;
}) {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent closeMode={closeMode} />
    </Suspense>
  );
}
