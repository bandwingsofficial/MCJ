"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import { CommunityStatusBadge } from "@/src/features/community/components/community-status-badge";
import { CommunityTypeBadge } from "@/src/features/community/components/CommunityTypeBadge";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";
import {
  formatCommunityDateTime,
  getCommunityManagementStatus,
  truncateCaption,
} from "@/src/features/community/utils/community-display.utils";

interface Props {
  post: CommunityPostDetails;
  onBack: () => void;
  onEdit?: () => void;
}

export function CommunityManageHeader({ post, onBack, onEdit }: Props) {
  const managementStatus = getCommunityManagementStatus(post);

  return (
    <header className="space-y-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
        <Link
          href="/dashboard"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <Link
          href="/community"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Community
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span aria-current="page" className="font-medium text-[#102A56]">
          Manage Post
        </span>
      </nav>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
            {truncateCaption(post.caption, 80)}
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <CommunityStatusBadge status={managementStatus} />
            <CommunityTypeBadge type={post.type} />
            <Badge variant="default" className="px-2 py-0 text-[11px]">
              {post.status}
            </Badge>
            <span className="text-xs text-[#647A9B]">
              Created {formatCommunityDateTime(post.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back to List
          </Button>
          {onEdit ? (
            <Button type="button" onClick={onEdit}>
              Edit Post
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
