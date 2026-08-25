import { AxiosError } from "axios";

interface ApiErrorResponse {
  success?: false;
  code?: string;
  message?: string | string[];
  errors?: Record<string, string[] | string>;
}

const CODE_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again later.",
  INVALID_TOKEN: "Your verification code is invalid or has expired.",
  SESSION_REVOKED: "Your session is no longer active. Please sign in again.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  ADMIN_MFA_REQUIRED: "Multi-factor authentication is required.",
  CATEGORY_ALREADY_EXISTS: "Category already exists.",
  CATEGORY_NOT_FOUND: "Category not found.",
  BRANCH_ALREADY_EXISTS: "Branch already exists.",
  BRANCH_NOT_FOUND: "Branch not found.",
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;
    const code = data?.code;
    const message = data?.message;
    const validationMessage = formatValidationErrors(data?.errors);

    if (code === "VALIDATION_ERROR" && validationMessage) {
      return validationMessage;
    }

    if (code && CODE_MESSAGES[code]) {
      // Prefer explicit API messages (e.g. "Branch name already exists.")
      if (
        status &&
        status < 500 &&
        typeof message === "string" &&
        message.trim()
      ) {
        return message;
      }
      return CODE_MESSAGES[code];
    }

    // Prefer explicit backend messages for validation/conflict responses
    if (
      status &&
      status < 500 &&
      typeof message === "string" &&
      message.trim()
    ) {
      return message;
    }

    if (Array.isArray(message) && message[0]) {
      return message[0];
    }

    if (status === 429) {
      return "Too many attempts. Please try again later.";
    }

    if (status === 403) {
      return "You don't have permission to access this area.";
    }

    if (status === 401) {
      return "Your session has expired. Please sign in again.";
    }

    if (status === 409) {
      return typeof message === "string" && message.trim()
        ? message
        : "This action conflicts with existing data.";
    }

    if (status && status >= 500) {
      return "Something went wrong on our side. Please try again.";
    }

    if (!error.response) {
      return "We couldn't connect to the server. Check your connection and try again.";
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

function formatValidationErrors(
  errors?: Record<string, string[] | string>,
): string | null {
  if (!errors) {
    return null;
  }

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      return value[0];
    }

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export const getErrorStatus = (error: unknown): number | null => {
  if (error instanceof AxiosError) {
    return error.response?.status ?? null;
  }
  return null;
};
