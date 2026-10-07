"use client";

import {
  AuthModal,
  type AuthModalCloseMode,
} from "@/src/features/auth/components/auth-modal";

export function LoginPage({
  closeMode = "back",
}: {
  closeMode?: AuthModalCloseMode;
}) {
  return <AuthModal mode="login" closeMode={closeMode} />;
}
