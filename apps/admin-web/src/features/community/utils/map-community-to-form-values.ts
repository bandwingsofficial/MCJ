import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import { DEFAULT_COMMUNITY_AUTHOR_LABEL } from "@/src/features/community/constants/community.constants";
import type { CommunityPostDetails } from "@/src/features/community/types/community.types";

export function mapCommunityToFormValues(
  post: CommunityPostDetails,
): CommunityFormValues {
  return {
    caption: post.caption ?? "",
    authorName: post.authorName ?? DEFAULT_COMMUNITY_AUTHOR_LABEL,
    hashtags: post.hashtags ?? [],
    location: post.location ?? "",
    status: post.status ?? "DRAFT",
    ctaEnabled: post.ctaEnabled ?? false,
    ctaButtonName: post.ctaLabel ?? "",
    ctaButtonLink: post.ctaUrl ?? "",
  };
}
