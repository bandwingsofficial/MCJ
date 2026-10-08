"use client";

import { AuthRouteModalBridge } from "@/src/features/auth/components/auth-modal-controller";
import type { AuthModalCloseMode } from "@/src/features/auth/components/auth-modal";

export function ForgotPasswordPage({
  closeMode = "back",
}: {
  closeMode?: AuthModalCloseMode;
}) {
  return (
    <AuthRouteModalBridge
      mode="forgot-password"
      dismiss={closeMode === "home" ? "home" : "back"}
    />
  );
}
