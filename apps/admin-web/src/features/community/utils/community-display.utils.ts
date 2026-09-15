import type {
  CommunityManagementStatus,
  CommunityPostListItem,
} from "@/src/features/community/types/community.types";

import { isArchivedCommunityPost } from "@/src/features/community/utils/community-bulk.utils";

type CommunityStatusSource = Pick<
  CommunityPostListItem,
  "isActive" | "isDeleted"
> & {
  deletedAt?: string | null;
};

export function getCommunityManagementStatus(
  item: CommunityStatusSource,
): CommunityManagementStatus {
  if (isArchivedCommunityPost(item)) {
    return "ARCHIVED";
  }

  if (item.isActive) {
    return "ACTIVE";
  }

  return "INACTIVE";
}

export function formatCommunityDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCommunityDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function truncateCaption(
  caption: string | null | undefined,
  maxLength = 120,
): string {
  const text = (caption ?? "").trim();

  if (!text) {
    return "No caption";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}…`;
}
