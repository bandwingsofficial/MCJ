export const AUTH_ROUTES = {
  LOGIN: "/login",

  DASHBOARD: "/dashboard",
} as const;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN:
    "branch_access_token",

  REFRESH_TOKEN:
    "branch_refresh_token",
} as const;