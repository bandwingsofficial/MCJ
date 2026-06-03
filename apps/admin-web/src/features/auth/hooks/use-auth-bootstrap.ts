"use client";

import { useEffect } from "react";

import { authService } from "@/src/features/auth/services/auth.service";

import { useAuthStore, UserRole } from "@/src/features/auth/store/auth.store";

import { TokenStorage } from "@/src/core/storage/token-storage";

export const useAuthBootstrap =
  (): void => {
    const setUser =
      useAuthStore(
        (state) => state.setUser
      );

    useEffect(() => {
      const bootstrap =
        async () => {
          const token =
            TokenStorage.getAccessToken();

          if (!token) {
            return;
          }

          try {
            const response =
              await authService.getProfile();

            setUser({
              id:
                response.data.id,
              email:
                response.data.email,
              name:
                response.data.name,
              role: 
                response.data.role as UserRole,
            });
          } catch {
            TokenStorage.clear();
          }
        };

      void bootstrap();
    }, [setUser]);
  };