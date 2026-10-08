"use client";

import { createContext, useContext } from "react";

export type AuthModalMode = "login" | "register" | "forgot-password";
export type AuthModalDismiss = "hide" | "home" | "back";

export interface OpenAuthModalInput {
  mode?: AuthModalMode;
  redirectTo?: string;
  referralCode?: string;
  dismiss?: AuthModalDismiss;
}

export interface AuthModalControllerValue {
  isOpen: boolean;
  mode: AuthModalMode;
  redirectTo?: string;
  referralCode?: string;
  openAuthModal: (input?: OpenAuthModalInput) => void;
  closeAuthModal: () => void;
  hideAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;
}

export const AuthModalControllerContext =
  createContext<AuthModalControllerValue | null>(null);

export function useAuthModalController(): AuthModalControllerValue {
  const value = useContext(AuthModalControllerContext);

  if (!value) {
    throw new Error("Auth modal controller is unavailable");
  }

  return value;
}
