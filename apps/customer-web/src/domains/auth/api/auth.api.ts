import { apiClient } from "@/src/shared/lib/api-client";

export const authApi = {
  register: (data: any) =>
    apiClient.post("/auth/register", data),

  login: (data: any) =>
    apiClient.post("/auth/login", data),

  // 🔥 refresh now uses cookies
  refresh: () =>
    apiClient.post("/auth/refresh"),

  logout: () =>
    apiClient.post("/auth/logout"),

  logoutAll: () =>
    apiClient.post("/auth/logout-all"),

  getSessions: () =>
    apiClient.get("/auth/sessions"),

  revokeSession: (id: string) =>
    apiClient.post(
      `/auth/sessions/${id}/revoke`
    ),

  requestPasswordReset: (
    email: string
  ) =>
    apiClient.post(
      "/auth/password-reset/request",
      {
        email,
      }
    ),

  confirmPasswordReset: (
    data: any
  ) =>
    apiClient.post(
      "/auth/password-reset/confirm",
      data
    ),

  me: () =>
    apiClient.get("/auth/me"),
};