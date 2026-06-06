"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { useRouter } from "next/navigation";

import { authService } from "@/src/features/auth/services/auth.service";

import { useAuthStore } from "@/src/features/auth/store/auth.store";

import {
  LoginFormValues,
} from "@/src/features/auth/schemas/login.schema";

import { appToast } from "@/src/shared/lib/toast";

interface ApiErrorResponse {
  success?: boolean;

  code?: string;

  message?: string;
}

export const useLogin = () => {
  const router = useRouter();

  const [isLoading, setIsLoading] =
    useState(false);

  const { setUser } =
    useAuthStore();

  const login = async (
    values: LoginFormValues
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response =
        await authService.login(
          values
        );

      setUser({
        id:
          response.data.id,

        firstName:
          response.data.firstName,

        lastName:
          response.data.lastName,

        email:
          response.data.email,

        phone:
          response.data.phone,

        role:
          response.data.role,

        permissions:
          response.data.permissions,

        branchId:
          response.data.branchId,

        isActive: true,

        lastLoginAt: null,
      });

      appToast.success(
        response.message ??
          "Login successful"
      );

      router.replace(
        "/dashboard"
      );

      return true;
    } catch (error) {
      const axiosError =
        error as AxiosError<ApiErrorResponse>;

      const status =
        axiosError.response?.status;

      const code =
        axiosError.response?.data?.code;

      const message =
        axiosError.response?.data?.message;

      switch (code) {
        case "INVALID_CREDENTIALS":
          appToast.error(
            message ??
              "Invalid credentials"
          );
          break;

        case "INVALID_TOKEN":
          appToast.error(
            message ??
              "Session expired"
          );
          break;

        case "TOKEN_REUSE_DETECTED":
          appToast.error(
            message ??
              "Security issue detected. Please login again."
          );
          break;

        default:
          switch (status) {
            case 400:
              appToast.error(
                message ??
                  "Invalid request"
              );
              break;

            case 401:
              appToast.error(
                message ??
                  "Unauthorized"
              );
              break;

            case 403:
              appToast.error(
                message ??
                  "Access denied"
              );
              break;

            case 404:
              appToast.error(
                message ??
                  "Resource not found"
              );
              break;

            case 409:
              appToast.error(
                message ??
                  "Conflict detected"
              );
              break;

            case 422:
              appToast.error(
                message ??
                  "Validation failed"
              );
              break;

            case 500:
              appToast.error(
                "Internal server error"
              );
              break;

            default:
              appToast.error(
                message ??
                  "Something went wrong"
              );
          }
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
  };
};