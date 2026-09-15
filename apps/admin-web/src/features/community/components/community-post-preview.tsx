"use client";

import { useEffect, useState } from "react";

import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

import { Avatar } from "@/src/shared/components/ui/avatar";

import { DEFAULT_COMMUNITY_AUTHOR_LABEL } from "@/src/features/community/constants/community.constants";

import type { CommunityPostType } from "@/src/features/community/types/community.types";

interface Props {
  type: CommunityPostType;
  caption: string;
  authorName?: string;
  mediaUrl?: string | null;
  mediaFile?: File | null;
  hashtags?: string[];
  location?: string;
}

export function CommunityPostPreview({
  type,
  caption,
  authorName,
  mediaUrl,
  mediaFile,
  hashtags = [],
  location,
}: Props) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const displayName = authorName?.trim() || DEFAULT_COMMUNITY_AUTHOR_LABEL;
  const avatarFallback = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!mediaFile) {
      setLocalPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(mediaFile);
    setLocalPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [mediaFile]);

  const previewSrc = localPreview ?? mediaUrl ?? null;

  const captionWithHashtags = [
    caption.trim(),
    hashtags.length > 0
      ? hashtags.map((tag) => `#${tag.replace(/^#/, "")}`).join(" ")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#EEF4FB] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Avatar src="" alt={displayName} fallback={avatarFallback} />
          <div>
            <p className="text-sm font-semibold text-[#102A56]">
              {displayName}
            </p>
            {location ? (
              <p className="text-[11px] text-[#647A9B]">{location}</p>
            ) : null}
          </div>
        </div>
        <MoreHorizontal className="h-4 w-4 text-[#647A9B]" aria-hidden="true" />
      </div>

      <div className="aspect-square bg-[#F8FBFF]">
        {previewSrc ? (
          type === "VIDEO" ? (
            <video
              src={previewSrc}
              controls
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={previewSrc}
              alt="Post preview"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#647A9B]">
            Upload media to preview
          </div>
        )}
      </div>

      <div className="space-y-2 px-3 py-2.5">
        <div className="flex items-center justify-between text-[#102A56]">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5" aria-hidden="true" />
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
            <Send className="h-5 w-5" aria-hidden="true" />
          </div>
          <Bookmark className="h-5 w-5" aria-hidden="true" />
        </div>

        <p className="whitespace-pre-wrap text-sm text-[#102A56]">
          <span className="mr-1 font-semibold">{displayName}</span>
          {captionWithHashtags || (
            <span className="text-[#647A9B]">Caption preview</span>
          )}
        </p>
      </div>
    </div>
  );
}
