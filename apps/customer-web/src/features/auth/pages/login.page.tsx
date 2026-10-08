"use client";

import { AuthRouteModalBridge } from "@/src/features/auth/components/auth-modal-controller";
import type { AuthModalCloseMode } from "@/src/features/auth/components/auth-modal";

export function LoginPage({
  closeMode = "back",
}: {
  closeMode?: AuthModalCloseMode;
}) {
  return (
    <AuthRouteModalBridge
      mode="login"
      dismiss={closeMode === "home" ? "home" : "back"}
    />
  );
}
