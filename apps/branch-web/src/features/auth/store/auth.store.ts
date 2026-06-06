import { create } from "zustand";

import {
  ProfileDto,
} from "@/src/features/auth/types/profile.types";

interface AuthStore {
  user: ProfileDto | null;

  isAuthenticated: boolean;

  setUser: (
    user: ProfileDto
  ) => void;

  clearUser: () => void;

  updateUser: (
    user: Partial<ProfileDto>
  ) => void;
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

    updateUser: (payload) =>
      set((state) => ({
        user: state.user
          ? {
              ...state.user,
              ...payload,
            }
          : null,
      })),

    clearUser: () =>
      set({
        user: null,
        isAuthenticated: false,
      }),
  }));