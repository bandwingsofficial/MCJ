"use client";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { authService } from "@/src/features/auth/services/auth.service";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

import type {
  LoginRequest,
  UserProfile,
} from "@/src/features/auth/types/auth.types";

export function useLogin() {
  const router = useRouter();

  const setUser =
    useAuthStore(
      (state) => state.setUser
    );

  return useMutation({
    mutationFn: (
      payload: LoginRequest
    ) =>
      authService.login(
        payload
      ),

    onSuccess: async () => {
      const profile: UserProfile =
        await authService.getProfile();

      setUser(profile);

      toast.success(
        "Login successful"
      );

      router.push(
        "/student"
      );
    },

    onError: (
      error: any
    ) => {
      // Safely extract the custom message returned by NestJS (e.g., "Invalid credentials")
      const backendMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Login failed";

      // If NestJS returns validation errors in an array, show the first item, else show the string
      toast.error(
        Array.isArray(backendMessage)
          ? backendMessage[0]
          : backendMessage
      );
    },
  });
}