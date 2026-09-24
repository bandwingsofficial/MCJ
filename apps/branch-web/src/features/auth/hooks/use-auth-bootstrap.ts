"use client";

import {
  useEffect,
  useState,
} from "react";

import { authService } from "@/src/features/auth/services/auth.service";
import { mapBranchUserMeToProfile } from "@/src/features/auth/utils/profile.mapper";

import { TokenStorage } from "@/src/core/storage/token-storage";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

export const useAuthBootstrap =
  () => {
    const [isLoading, setIsLoading] =
      useState(true);

    const {
      setUser,
      clearUser,
    } = useAuthStore();

    useEffect(() => {
      const bootstrap =
        async (): Promise<void> => {
          try {
            const accessToken =
              TokenStorage.getAccessToken();

            if (!accessToken) {
              setIsLoading(false);
              return;
            }

            const response =
              await authService.getProfile();

            setUser(mapBranchUserMeToProfile(response.data));
          } catch {
            TokenStorage.clear();

            clearUser();
          } finally {
            setIsLoading(false);
          }
        };

      void bootstrap();
    }, [
      setUser,
      clearUser,
    ]);

    return {
      isLoading,
    };
  };