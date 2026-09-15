"use client";

import { Card } from "@/src/shared/components/ui/card";

import { CommunityStatistics } from "@/src/features/community/components/details/CommunityStatistics";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";
import {
  formatCommunityDateTime,
  getCommunityManagementStatus,
} from "@/src/features/community/utils/community-display.utils";
import { COMMUNITY_MANAGEMENT_STATUS_LABELS } from "@/src/features/community/constants/community.constants";

interface Props {
  post: CommunityPostDetails;
}

export function CommunityManageOverviewPanel({ post }: Props) {
  const managementStatus = getCommunityManagementStatus(post);

  return (
    <div className="space-y-4">
      <CommunityStatistics post={post} />

      <Card className="space-y-4 rounded-xl border-[#E1EBF5] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">
          Post Details
        </h2>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Management Status</dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {COMMUNITY_MANAGEMENT_STATUS_LABELS[managementStatus]}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Publish Status</dt>
            <dd className="mt-1 text-sm text-[#102A56]">{post.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Location</dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {post.location || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Media File ID</dt>
            <dd className="mt-1 break-all text-sm text-[#102A56]">
              {post.mediaFileId || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Created</dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {formatCommunityDateTime(post.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[#647A9B]">Updated</dt>
            <dd className="mt-1 text-sm text-[#102A56]">
              {formatCommunityDateTime(post.updatedAt)}
            </dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-[#102A56]">Caption</h3>
          <p className="whitespace-pre-wrap text-sm text-[#102A56]">
            {post.caption || "—"}
          </p>
        </div>

        {post.hashtags.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#102A56]">Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-[#EEF4FB] px-2 py-1 text-xs text-[#2563EB]"
                >
                  #{tag.replace(/^#/, "")}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {post.mentions.length > 0 ? (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#102A56]">Mentions</h3>
            <div className="flex flex-wrap gap-2">
              {post.mentions.map((mention) => (
                <span
                  key={mention}
                  className="rounded bg-slate-100 px-2 py-1 text-xs text-[#102A56]"
                >
                  @{mention.replace(/^@/, "")}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
