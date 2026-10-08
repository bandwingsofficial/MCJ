"use client";

import { Suspense } from "react";

import { AuthRouteModalBridge } from "@/src/features/auth/components/auth-modal-controller";
import type { AuthModalCloseMode } from "@/src/features/auth/components/auth-modal";

function RegisterPageContent({
  closeMode,
}: {
  closeMode: AuthModalCloseMode;
}) {
  return (
    <AuthRouteModalBridge
      mode="register"
      dismiss={closeMode === "home" ? "home" : "back"}
    />
  );
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
