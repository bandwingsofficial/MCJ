import { AxiosError } from "axios";

interface ApiErrorResponse {
  success?: false;
  code?: string;
  message?: string | string[];
  errors?: Record<string, string[] | string>;
  meta?: {
    field?: string;
    existingEnrollment?: {
      status?: string;
      branch?: { branchName?: string };
      batch?: { name?: string; code?: string };
      course?: { title?: string };
    };
  };
}

/** Preserves API error details after service-layer wrapping. */
export class ApiClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly errors?: Record<string, string[] | string>;
  readonly meta?: ApiErrorResponse["meta"];

  constructor(
    message: string,
    options?: {
      code?: string;
      status?: number;
      errors?: Record<string, string[] | string>;
      meta?: ApiErrorResponse["meta"];
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.status = options?.status;
    this.errors = options?.errors;
    this.meta = options?.meta;
  }
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
  BRANCH_USER_NOT_FOUND: "User not found.",
  EMAIL_ALREADY_EXISTS: "An active user already exists with this email.",
  PHONE_ALREADY_EXISTS:
    "An active user already exists with this phone number.",
  ROLE_ASSIGNMENT_DENIED:
    "You are not authorized to create or assign this role.",
  STUDENT_ALREADY_ENROLLED:
    "Student is already actively enrolled. A student can have only one active enrollment at a time.",
  STUDENT_EMAIL_EXISTS:
    "A student with this email already exists. Use a different email address.",
  STUDENT_PHONE_EXISTS:
    "A student with this phone number already exists. Use a different phone number.",
  STUDENT_CODE_EXISTS:
    "A student with this student code already exists. Use a different code.",
  STUDENT_ALREADY_EXISTS: "This student already exists.",
  STUDENT_NOT_FOUND: "Student could not be found.",
  VALIDATION_ERROR: "Please correct the highlighted fields.",
  BATCH_NOT_SELECTABLE:
    "Completed or expired batches cannot be selected.",
  INTERNAL_SERVER_ERROR:
    "Unable to complete this action right now. Please try again.",
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    return resolveMessage({
      status: error.status,
      code: error.code,
      message: error.message,
      errors: error.errors,
      meta: error.meta,
    });
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;
    return resolveMessage({
      status,
      code: data?.code,
      message: data?.message,
      errors: data?.errors,
      meta: data?.meta,
      hasResponse: Boolean(error.response),
    });
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to complete this action right now. Please try again.";
};

export function toApiClientError(error: unknown): Error {
  if (error instanceof ApiClientError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return new ApiClientError(getErrorMessage(error), {
      code: data?.code,
      status: error.response?.status,
      errors: data?.errors,
      meta: data?.meta,
    });
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unable to complete this action right now. Please try again.");
}

/** Field → message map for form setError. */
export function getErrorFieldErrors(
  error: unknown,
): Record<string, string> {
  const payload = extractErrorPayload(error);
  const result: Record<string, string> = {};

  if (payload?.errors) {
    for (const [field, value] of Object.entries(payload.errors)) {
      if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
        result[field] = value[0];
      } else if (typeof value === "string" && value.trim()) {
        result[field] = value;
      }
    }
  }

  const field = payload?.meta?.field;
  const message = payload?.message;
  if (
    typeof field === "string" &&
    field.trim() &&
    typeof message === "string" &&
    message.trim() &&
    !result[field]
  ) {
    result[field] = message;
  }

  return result;
}

export const getErrorStatus = (error: unknown): number | null => {
  if (error instanceof ApiClientError) {
    return error.status ?? null;
  }
  if (error instanceof AxiosError) {
    return error.response?.status ?? null;
  }
  return null;
};

export const getErrorCode = (error: unknown): string | null => {
  if (error instanceof ApiClientError) {
    return error.code ?? null;
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.code ?? null;
  }
  return null;
};

function extractErrorPayload(error: unknown): ApiErrorResponse | null {
  if (error instanceof ApiClientError) {
    return {
      code: error.code,
      message: error.message,
      errors: error.errors,
      meta: error.meta,
    };
  }

  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorResponse | undefined) ?? null;
  }

  return null;
}

function resolveMessage(input: {
  status?: number;
  code?: string;
  message?: string | string[];
  errors?: Record<string, string[] | string>;
  meta?: ApiErrorResponse["meta"];
  hasResponse?: boolean;
}): string {
  const { status, code, message, errors, meta, hasResponse } = input;
  const validationMessage = formatValidationErrors(errors);

  if (code === "VALIDATION_ERROR" && validationMessage) {
    return validationMessage;
  }

  if (code && CODE_MESSAGES[code]) {
    if (
      status &&
      status < 500 &&
      typeof message === "string" &&
      message.trim() &&
      !isOpaqueServerMessage(message)
    ) {
      return withExistingEnrollment(message, meta);
    }
    return withExistingEnrollment(CODE_MESSAGES[code], meta);
  }

  if (
    status &&
    status < 500 &&
    typeof message === "string" &&
    message.trim() &&
    !isOpaqueServerMessage(message)
  ) {
    return withExistingEnrollment(message, meta);
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
    return withExistingEnrollment(
      typeof message === "string" && message.trim() && !isOpaqueServerMessage(message)
        ? message
        : "This action conflicts with existing data.",
      meta,
    );
  }

  if (status && status >= 500) {
    return "Unable to complete this action right now. Please try again.";
  }

  if (hasResponse === false) {
    return "We couldn't connect to the server. Check your connection and try again.";
  }

  if (typeof message === "string" && message.trim() && !isOpaqueServerMessage(message)) {
    return message;
  }

  return "Unable to complete this action right now. Please try again.";
}

function isOpaqueServerMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return (
    normalized === "something went wrong" ||
    normalized === "internal server error" ||
    normalized === "internal_server_error"
  );
}

function withExistingEnrollment(
  message: string,
  meta?: ApiErrorResponse["meta"],
): string {
  const existing = meta?.existingEnrollment;
  if (!existing) {
    return message;
  }

  const branch = existing.branch?.branchName?.trim();
  const batch = existing.batch?.name?.trim();

  if (branch && batch) {
    return `Student is already actively enrolled in ${branch} - ${batch} batch. A student can have only one active enrollment at a time.`;
  }

  return message;
}

function formatValidationErrors(
  errors?: Record<string, string[] | string>,
): string | null {
  if (!errors) {
    return null;
  }

  const messages: string[] = [];

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
      messages.push(value[0]);
      continue;
    }

    if (typeof value === "string" && value.trim()) {
      messages.push(value);
    }
  }

  if (messages.length === 0) {
    return null;
  }

  // Prefer returning the first for toast; forms use getErrorFieldErrors for all.
  return messages[0];
}
