import { AxiosError } from "axios";

interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    errors?: Record<string, string[]>;
  };
}

export interface CommunityFormFieldErrors {
  type?: string;
  caption?: string;
  authorName?: string;
  media?: string;
  hashtags?: string;
  mentions?: string;
  location?: string;
  status?: string;
  ctaButtonName?: string;
  ctaButtonLink?: string;
  root?: string;
}

export function mapCommunityApiError(
  error: unknown,
): CommunityFormFieldErrors {
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

  const mapped: CommunityFormFieldErrors = {};

  if (fieldErrors.type?.[0]) {
    mapped.type = fieldErrors.type[0];
  }

  if (fieldErrors.caption?.[0]) {
    mapped.caption = fieldErrors.caption[0];
  }

  if (fieldErrors.authorName?.[0]) {
    mapped.authorName = fieldErrors.authorName[0];
  }

  if (fieldErrors.media?.[0]) {
    mapped.media = fieldErrors.media[0];
  }

  if (fieldErrors.mediaFileId?.[0]) {
    mapped.media = fieldErrors.mediaFileId[0];
  }

  if (fieldErrors.hashtags?.[0]) {
    mapped.hashtags = fieldErrors.hashtags[0];
  }

  if (fieldErrors.mentions?.[0]) {
    mapped.mentions = fieldErrors.mentions[0];
  }

  if (fieldErrors.location?.[0]) {
    mapped.location = fieldErrors.location[0];
  }

  if (fieldErrors.status?.[0]) {
    mapped.status = fieldErrors.status[0];
  }

  if (fieldErrors.ctaLabel?.[0]) {
    mapped.ctaButtonName = fieldErrors.ctaLabel[0];
  }

  if (fieldErrors.ctaUrl?.[0]) {
    mapped.ctaButtonLink = fieldErrors.ctaUrl[0];
  }

  if (
    !mapped.type &&
    !mapped.caption &&
    !mapped.authorName &&
    !mapped.media &&
    !mapped.hashtags &&
    !mapped.mentions &&
    !mapped.location &&
    !mapped.status &&
    !mapped.ctaButtonName &&
    !mapped.ctaButtonLink
  ) {
    mapped.root = message ?? "Request failed. Please try again.";
  }

  return mapped;
}
