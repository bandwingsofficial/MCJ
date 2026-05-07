"use client";

import { create } from "zustand";

import { persist } from "zustand/middleware";

// ==============================
// USER TYPE
// ==============================

export interface User {
  id: string;

  email: string;

  name: string;

  role: string;

  phone?: string;

  sessionId?: string;
}

// ==============================
// STORE TYPE
// ==============================

interface AuthState {
  user: User | null;

  // ==========================
  // ACTIONS
  // ==========================

  setUser: (
    user: User
  ) => void;

  clearUser: () => void;
}

// ==============================
// STORE
// ==============================

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        // ======================
        // STATE
        // ======================

        user: null,

        // ======================
        // SET USER
        // ======================

        setUser: (user) =>
          set({
            user,
          }),

        // ======================
        // CLEAR USER
        // ======================

        clearUser: () =>
          set({
            user: null,
          }),
      }),

      {
        // ======================
        // STORAGE KEY
        // ======================

        name: "auth-storage",

        // ======================
        // ONLY PERSIST USER
        // ======================

        partialize: (state) => ({
          user: state.user,
        }),
      }
    )
  );