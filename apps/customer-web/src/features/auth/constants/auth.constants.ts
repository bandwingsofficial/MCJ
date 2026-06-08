// src/features/auth/constants/auth.constants.ts

export const AUTH_ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/dashboard",
} as const;

export const AUTH_QUERY_KEYS = {
  PROFILE: ["profile"],
  SESSIONS: ["sessions"],
} as const;

export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
} as const;

export const OTP_RULES = {
  LENGTH: 6,
} as const;