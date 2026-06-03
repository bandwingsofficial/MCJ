// src/features/auth/store/auth.store.ts

import { create } from "zustand";

export type UserRole =
  | "ADMIN"
  | "SUPER_ADMIN"
  | "BRANCH_ADMIN";


export interface AuthUser {
  id: string;

  email: string;

  name: string;

  role: UserRole;
}

interface AuthStore {
  user: AuthUser | null;

  isAuthenticated: boolean;

  setUser: (
    user: AuthUser
  ) => void;

  clearUser: () => void;
}

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,

    isAuthenticated: false,

    setUser: (user) =>
      set({
        user,
        isAuthenticated: true,
      }),

    clearUser: () =>
      set({
        user: null,
        isAuthenticated: false,
      }),
  }));