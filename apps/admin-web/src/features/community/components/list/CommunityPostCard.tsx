"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Checkbox } from "@/src/shared/components/ui/checkbox";

import { CommunityPostActions } from "@/src/features/community/components/community-post-actions";
import { CommunityStatusBadge } from "@/src/features/community/components/community-status-badge";
import { CommunityTypeBadge } from "@/src/features/community/components/CommunityTypeBadge";

import { DEFAULT_COMMUNITY_AUTHOR_LABEL } from "@/src/features/community/constants/community.constants";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";
import {
  formatCommunityDate,
  getCommunityManagementStatus,
  truncateCaption,
} from "@/src/features/community/utils/community-display.utils";

interface CommunityPostCardProps {
  post: CommunityPostListItem;
  selected?: boolean;
  selectionDisabled?: boolean;
  actionsDisabled?: boolean;
  onSelectChange?: (postId: string, selected: boolean) => void;
  onManage?: (post: CommunityPostListItem) => void;
  onEdit?: (post: CommunityPostListItem) => void;
  onActivate?: (post: CommunityPostListItem) => void;
  onDeactivate?: (post: CommunityPostListItem) => void;
  onDelete?: (post: CommunityPostListItem) => void;
  onRestore?: (post: CommunityPostListItem) => void;
  onPermanentDelete?: (post: CommunityPostListItem) => void;
}

export function CommunityPostCard({
  post,
  selected = false,
  selectionDisabled = false,
  actionsDisabled = false,
  onSelectChange,
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: CommunityPostCardProps) {
  const managementStatus = getCommunityManagementStatus(post);
  const mediaSrc = post.thumbnailUrl ?? post.mediaUrl;

  return (
    <Card className="overflow-hidden rounded-xl border-[#E1EBF5] shadow-sm transition-shadow hover:shadow-[0_2px_10px_rgba(16,42,86,0.08)]">
      <div className="relative aspect-[4/3] bg-[#F8FBFF]">
        {mediaSrc ? (
          post.type === "VIDEO" ? (
            <video
              src={mediaSrc}
              className="h-full w-full object-cover"
              muted
            />
          ) : (
            <img
              src={mediaSrc}
              alt={post.caption ?? "Community post"}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#647A9B]">
            No media
          </div>
        )}

        <div className="absolute left-2 top-2">
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Checkbox
              checked={selected}
              disabled={selectionDisabled}
              onCheckedChange={(checked) =>
                onSelectChange?.(post.id, checked)
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold text-[#102A56]">
              {DEFAULT_COMMUNITY_AUTHOR_LABEL}
            </p>
            <p className="text-xs text-[#647A9B]">
              {formatCommunityDate(post.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <CommunityStatusBadge status={managementStatus} />
            <CommunityTypeBadge type={post.type} />
            <Badge
              variant={
                post.status === "PUBLISHED"
                  ? "success"
                  : post.status === "DRAFT"
                    ? "warning"
                    : "default"
              }
              className="px-2 py-0 text-[11px] font-semibold leading-5"
            >
              {post.status}
            </Badge>
          </div>
        </div>

        <p className="line-clamp-3 text-sm text-[#102A56]">
          {truncateCaption(post.caption, 180)}
        </p>

        {post.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-[#EEF4FB] px-2 py-0.5 text-[11px] text-[#2563EB]"
              >
                #{tag.replace(/^#/, "")}
              </span>
            ))}
            {post.hashtags.length > 4 ? (
              <span className="text-[11px] text-[#647A9B]">
                +{post.hashtags.length - 4} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-4 gap-2 border-t border-[#EEF4FB] pt-3 text-center text-xs text-[#647A9B]">
          <div>
            <p className="font-semibold text-[#102A56]">{post.viewCount}</p>
            <p>Views</p>
          </div>
          <div>
            <p className="font-semibold text-[#102A56]">{post.likeCount}</p>
            <p>Likes</p>
          </div>
          <div>
            <p className="font-semibold text-[#102A56]">
              {post.commentCount}
            </p>
            <p>Comments</p>
          </div>
          <div>
            <p className="font-semibold text-[#102A56]">{post.shareCount}</p>
            <p>Shares</p>
          </div>
        </div>

        {onManage &&
        onEdit &&
        onActivate &&
        onDeactivate &&
        onDelete &&
        onRestore &&
        onPermanentDelete ? (
          <CommunityPostActions
            item={post}
            disabled={actionsDisabled}
            onManage={onManage}
            onEdit={onEdit}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onDelete={onDelete}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
          />
        ) : null}
      </div>
    </Card>
  );
}
