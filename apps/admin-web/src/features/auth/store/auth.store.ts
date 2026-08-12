// src/features/auth/store/auth.store.ts

import { create } from "zustand";

/** Matches backend Role.ADMIN */
export type UserRole = "ADMIN";

export type AuthStatus =
  | "UNKNOWN"
  | "BOOTSTRAPPING"
  | "AUTHENTICATING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "REFRESHING"
  | "MFA_REQUIRED";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  mfaEnabled?: boolean;
  sessionId?: string | null;
}

interface AuthStore {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;

  setStatus: (status: AuthStatus) => void;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  markUnauthenticated: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "UNKNOWN",
  isAuthenticated: false,

  setStatus: (status) => set({ status }),

  setUser: (user) =>
    set({
      user,
      status: "AUTHENTICATED",
      isAuthenticated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      status: "UNAUTHENTICATED",
      isAuthenticated: false,
    }),

  markUnauthenticated: () =>
    set({
      user: null,
      status: "UNAUTHENTICATED",
      isAuthenticated: false,
    }),
}));
