// src/features/auth/mappers/auth.mapper.ts

const AUTH_ERROR_MESSAGES: Record<
  string,
  string
> = {
  USER_ALREADY_EXISTS:
    "An account already exists with these details.",

  INVALID_TOKEN:
    "Invalid or expired token.",

  TOKEN_REUSE_DETECTED:
    "Your session has expired. Please login again.",

  TOO_MANY_REQUESTS:
    "Too many requests. Please try again later.",

  VALIDATION_ERROR:
    "Please check your entered information.",

  HTTP_ERROR:
    "Request failed. Please try again.",

  UNAUTHORIZED:
    "You are not authorized.",

  FORBIDDEN:
    "You do not have permission.",

  NOT_FOUND:
    "Requested resource not found.",
};

export function mapAuthError(
  code?: string,
  fallback?: string
): string {
  if (!code) {
    return (
      fallback ??
      "Something went wrong."
    );
  }

  return (
    AUTH_ERROR_MESSAGES[code] ??
    fallback ??
    "Something went wrong."
  );
}