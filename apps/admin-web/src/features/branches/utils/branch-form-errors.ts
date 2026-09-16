import { AxiosError } from "axios";

interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    errors?: Record<string, string[]>;
  };
}

export interface BranchFormFieldErrors {
  image?: string;
  root?: string;
}

export function mapBranchApiError(
  error: unknown,
): BranchFormFieldErrors {
  if (!(error instanceof AxiosError)) {
    return {
      root:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  const message = data?.message;
  const fieldErrors =
    data?.errors ??
    (
      data?.meta as { errors?: Record<string, string[]> } | undefined
    )?.errors ??
    {};

  const mapped: BranchFormFieldErrors = {};

  if (fieldErrors.thumbnailFileId?.[0]) {
    mapped.image = fieldErrors.thumbnailFileId[0];
  }

  const lowerMessage = (message ?? "").toLowerCase();

  if (
    lowerMessage.includes("thumbnail") ||
    lowerMessage.includes("image") ||
    fieldErrors.thumbnailFileId?.length
  ) {
    mapped.image =
      fieldErrors.thumbnailFileId?.[0] ??
      message ??
      "Invalid branch image.";
  } else if (!mapped.image) {
    mapped.root = message ?? "Request failed. Please try again.";
  }

  return mapped;
}
