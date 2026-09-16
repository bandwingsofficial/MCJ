import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AuthState,
  UserProfile,
} from "@/src/features/auth/types/auth.types";

export const useAuthStore =
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,

        isAuthenticated: false,

        isLoading: false,

        setUser: (
          user: UserProfile
        ) =>
          set({
            user,
            isAuthenticated: true,
          }),

        clearUser: () =>
          set({
            user: null,
            isAuthenticated: false,
          }),

        setLoading: (
          isLoading: boolean
        ) =>
          set({
            isLoading,
          }),
      }),
      {
        name: "mcj_auth_store", // Unique storage key for keeping track of your session state
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }), // Only syncs user profiles and login checks, leaving load states out of it
      }
    )
  );