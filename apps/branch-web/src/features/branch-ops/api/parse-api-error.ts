export interface BranchOpsApiError {
  status?: number;
  code?: string;
  message?: string;
  field?: string;
  errors?: Record<string, string[] | string>;
}

export function parseBranchOpsError(error: unknown): BranchOpsApiError {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return {};
  }

  const response = (
    error as {
      response?: {
        status?: number;
        data?: {
          code?: string;
          message?: string | string[];
          meta?: { field?: string };
          errors?: Record<string, string[] | string>;
        };
      };
    }
  ).response;

  const rawMessage = response?.data?.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage[0]
    : rawMessage;

  return {
    status: response?.status,
    code: response?.data?.code,
    message,
    field: response?.data?.meta?.field,
    errors: response?.data?.errors,
  };
}

export function isEmailConflict(error: BranchOpsApiError): boolean {
  if (error.status !== 409) return false;
  if (error.code === "DELETED_ACCOUNT_RESTORABLE") return false;
  if (error.code === "PHONE_BELONGS_TO_DELETED_USER") return false;
  if (error.code === "IDENTITY_MERGE_CONFLICT") return false;
  if (error.field === "phone") return false;
  if (error.field === "email") return true;
  if (error.code === "EMAIL_ALREADY_EXISTS") return true;
  if (error.code === "BRANCH_USER_ALREADY_EXISTS") return true;
  return /email/i.test(error.message ?? "");
}

export function isDeletedAccountRestorable(error: BranchOpsApiError): boolean {
  return (
    error.status === 409 && error.code === "DELETED_ACCOUNT_RESTORABLE"
  );
}

export function isPhoneConflict(error: BranchOpsApiError): boolean {
  if (error.status !== 409) return false;
  if (error.field === "phone") return true;
  if (error.code === "PHONE_ALREADY_EXISTS") return true;
  return /phone/i.test(error.message ?? "");
}

export function userFacingApiMessage(
  error: BranchOpsApiError,
  fallback = "Something went wrong on our side. Please try again.",
): string {
  if (error.status === 401) {
    return error.message || "Please sign in again.";
  }

  if (error.status === 403) {
    return error.message || "You are not authorized to perform this action.";
  }

  if (error.status === 404) {
    return error.message || "User not found.";
  }

  if (error.status === 400 || error.status === 422) {
    const message = error.message ?? "";
    if (/^(take|skip) must/i.test(message)) {
      return fallback;
    }
    return message || "Please check the details and try again.";
  }

  if (error.status === 409) {
    return error.message || "This value is already in use.";
  }

  if (error.status && error.status < 500 && error.message) {
    return error.message;
  }

  if (error.status && error.status >= 500) {
    return "Unable to complete this action right now. Please try again.";
  }

  return fallback === "Something went wrong on our side. Please try again."
    ? "Unable to complete this action right now. Please try again."
    : fallback;
}
