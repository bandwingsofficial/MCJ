import type {
  CommunityManagementStatus,
  CommunityPostStatus,
  CommunityPostType,
} from "@/src/features/community/types/community.types";

export const DEFAULT_COMMUNITY_PAGE_SIZE = 20;

export const COMMUNITY_UPLOAD_FOLDER = "community";

export const CAPTION_MAX_CHARS = 2200;

export const MAX_LOCATION_LENGTH = 150;

export const DEFAULT_COMMUNITY_AUTHOR_LABEL = "MCJ Community";

export const COMMUNITY_POST_TYPES: {
  label: string;
  value: CommunityPostType;
}[] = [
  { label: "Image", value: "IMAGE" },
  { label: "Video", value: "VIDEO" },
];

export const COMMUNITY_POST_STATUSES: {
  label: string;
  value: CommunityPostStatus;
}[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const COMMUNITY_MANAGEMENT_STATUS_LABELS: Record<
  CommunityManagementStatus,
  string
> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ARCHIVED: "Archived",
};

export const COMMUNITY_FILTER_STATUS_OPTIONS: {
  label: string;
  value: CommunityManagementStatus | "ALL";
}[] = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];
