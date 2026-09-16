"use client";

import { useEffect } from "react";

import { apiClient } from "@/src/core/api/axios";

import { requestInterceptor } from "@/src/core/interceptors/request.interceptor";

import { responseErrorInterceptor } from "@/src/core/interceptors/response.interceptor";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({
  children,
}: AppProviderProps) {
  useEffect(() => {
    const requestId =
      apiClient.interceptors.request.use(
        requestInterceptor
      );

    const responseId =
      apiClient.interceptors.response.use(
        (response) => response,
        responseErrorInterceptor
      );

    return () => {
      apiClient.interceptors.request.eject(
        requestId
      );

      apiClient.interceptors.response.eject(
        responseId
      );
    };
  }, []);

  return children;
}