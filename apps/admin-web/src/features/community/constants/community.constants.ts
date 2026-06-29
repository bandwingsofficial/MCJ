import type {
  CommunityPostStatus,
  CommunityPostType,
} from "@/src/features/community/types/community.types";

export const COMMUNITY_POST_TYPES: {
  label: string;
  value: CommunityPostType;
}[] = [
  {
    label: "Image",
    value: "IMAGE",
  },
  {
    label: "Video",
    value: "VIDEO",
  },
];

export const COMMUNITY_POST_STATUSES: {
  label: string;
  value: CommunityPostStatus;
}[] = [
  {
    label: "Draft",
    value: "DRAFT",
  },
  {
    label: "Published",
    value: "PUBLISHED",
  },
  {
    label: "Archived",
    value: "ARCHIVED",
  },
];

export const DEFAULT_COMMUNITY_FILTERS = {
  search: "",

  status: "",

  type: "",

  includeDeleted: false,
};

export const COMMUNITY_PAGE_SIZE = 10;

export const MAX_CAPTION_LENGTH = 1000;

export const MAX_LOCATION_LENGTH = 150;

export const EMPTY_COMMUNITY_MESSAGE =
  "No community posts found.";

export const DELETE_COMMUNITY_CONFIRMATION =
  "Are you sure you want to delete this community post?";

export const RESTORE_COMMUNITY_CONFIRMATION =
  "Are you sure you want to restore this community post?";

export const PERMANENT_DELETE_CONFIRMATION =
  "This action cannot be undone. Permanently delete this community post?";

export const BLOCK_COMMENT_CONFIRMATION =
  "Are you sure you want to block this comment?";

export const UNBLOCK_COMMENT_CONFIRMATION =
  "Are you sure you want to unblock this comment?";