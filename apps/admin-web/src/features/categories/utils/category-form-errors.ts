import { AxiosError } from "axios";

interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    errors?: Record<string, string[]>;
  };
}

export interface CategoryFormFieldErrors {
  name?: string;
  slug?: string;
  description?: string;
  displayOrder?: string;
  image?: string;
  root?: string;
}

export function mapCategoryApiError(
  error: unknown,
): CategoryFormFieldErrors {
  if (!(error instanceof AxiosError)) {
    return {
      root:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  const code = data?.code;
  const message = data?.message;
  const metaErrors = (
    data?.meta as { errors?: Record<string, string[]> } | undefined
  )?.errors;
  const fieldErrors = data?.errors ?? metaErrors ?? {};

  const mapped: CategoryFormFieldErrors = {};

  if (fieldErrors.name?.[0]) {
    mapped.name = fieldErrors.name[0];
  }

  if (fieldErrors.slug?.[0]) {
    mapped.slug = fieldErrors.slug[0];
  }

  if (fieldErrors.description?.[0]) {
    mapped.description = fieldErrors.description[0];
  }

  if (fieldErrors.displayOrder?.[0]) {
    mapped.displayOrder = fieldErrors.displayOrder[0];
  }

  if (fieldErrors.thumbnailFileId?.[0]) {
    mapped.image = fieldErrors.thumbnailFileId[0];
  }

  const lowerMessage = (message ?? "").toLowerCase();

  if (code === "CATEGORY_ALREADY_EXISTS") {
    if (
      lowerMessage.includes("slug") ||
      fieldErrors.slug?.length
    ) {
      mapped.slug =
        fieldErrors.slug?.[0] ??
        message ??
        "Category slug already exists.";
    } else {
      mapped.name =
        fieldErrors.name?.[0] ??
        message ??
        "Category name already exists.";
    }
  } else if (code === "VALIDATION_ERROR") {
    if (
      lowerMessage.includes("slug") ||
      fieldErrors.slug?.length
    ) {
      mapped.slug =
        fieldErrors.slug?.[0] ??
        message ??
        "Invalid slug.";
    } else if (
      lowerMessage.includes("description") ||
      fieldErrors.description?.length
    ) {
      mapped.description =
        fieldErrors.description?.[0] ??
        message ??
        "Invalid description.";
    } else if (
      lowerMessage.includes("display order") ||
      fieldErrors.displayOrder?.length
    ) {
      mapped.displayOrder =
        fieldErrors.displayOrder?.[0] ??
        message ??
        "Invalid display order.";
    } else if (
      lowerMessage.includes("thumbnail") ||
      lowerMessage.includes("image") ||
      fieldErrors.thumbnailFileId?.length
    ) {
      mapped.image =
        fieldErrors.thumbnailFileId?.[0] ??
        message ??
        "Invalid category image.";
    } else if (fieldErrors.name?.[0]) {
      mapped.name = fieldErrors.name[0];
    } else {
      mapped.root = message ?? "Validation failed. Please review the form.";
    }
  } else if (
    error.response?.status === 403 ||
    code === "FORBIDDEN"
  ) {
    mapped.root = message ?? "You do not have permission to perform this action.";
  } else if (
    !mapped.name &&
    !mapped.slug &&
    !mapped.description &&
    !mapped.displayOrder &&
    !mapped.image
  ) {
    mapped.root = message ?? "Request failed. Please try again.";
  }

  return mapped;
}
