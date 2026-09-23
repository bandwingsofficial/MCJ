"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

import { DEFAULT_COMMUNITY_AUTHOR_LABEL } from "@/src/features/community/constants/community.constants";
import type { CommunityMediaFormItem } from "@/src/features/community/utils/community-media.utils";
import { reorderCommunityMediaItems } from "@/src/features/community/utils/community-media.utils";

import type { CommunityPostType } from "@/src/features/community/types/community.types";

interface PreviewMediaItem {
  clientId: string;
  mediaType: CommunityPostType;
  previewUrl?: string | null;
  url?: string | null;
  file?: File | null;
  isPrimary?: boolean;
}

interface Props {
  type: CommunityPostType;
  caption: string;
  authorName?: string;
  mediaItems?: CommunityMediaFormItem[] | PreviewMediaItem[];
  mediaUrl?: string | null;
  mediaFile?: File | null;
  hashtags?: string[];
  location?: string;
  ctaEnabled?: boolean;
  ctaButtonName?: string;
  ctaButtonLink?: string;
}

function resolvePreviewUrl(item: PreviewMediaItem): string | null {
  if (item.file) {
    return null;
  }

  return item.previewUrl ?? item.url ?? null;
}

function MediaSlide({
  item,
  objectUrl,
}: {
  item: PreviewMediaItem;
  objectUrl: string | null;
}) {
  const src = objectUrl ?? resolvePreviewUrl(item);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#647A9B]">
        Upload media to preview
      </div>
    );
  }

  if (item.mediaType === "VIDEO") {
    return (
      <video
        src={src}
        controls
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <img
      src={src}
      alt="Post preview"
      className="h-full w-full object-cover"
    />
  );
}

export function CommunityPostPreview({
  type,
  caption,
  authorName,
  mediaItems = [],
  mediaUrl,
  mediaFile,
  hashtags = [],
  location,
  ctaEnabled = false,
  ctaButtonName = "",
  ctaButtonLink = "",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});

  const displayName = authorName?.trim() || DEFAULT_COMMUNITY_AUTHOR_LABEL;
  const avatarFallback = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const normalizedItems = useMemo(() => {
    if (mediaItems.length > 0) {
      return reorderCommunityMediaItems(
        mediaItems.map((item, index) => ({
          clientId: item.clientId,
          mediaType: item.mediaType,
          previewUrl: item.previewUrl,
          url: item.url,
          file: item.file,
          displayOrder: "displayOrder" in item ? item.displayOrder : index,
          isPrimary: ("isPrimary" in item ? item.isPrimary : false) ?? false,
        })),
      );
    }

    if (mediaFile || mediaUrl) {
      return [
        {
          clientId: "legacy-media",
          mediaType: type,
          previewUrl: mediaUrl,
          url: mediaUrl,
          file: mediaFile,
          displayOrder: 0,
          isPrimary: type === "IMAGE",
        },
      ];
    }

    return [];
  }, [mediaFile, mediaItems, mediaUrl, type]);

  useEffect(() => {
    const nextUrls: Record<string, string> = {};

    normalizedItems.forEach((item) => {
      if (item.file) {
        nextUrls[item.clientId] = URL.createObjectURL(item.file);
      }
    });

    setObjectUrls(nextUrls);

    return () => {
      Object.values(nextUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [normalizedItems]);

  useEffect(() => {
    if (activeIndex >= normalizedItems.length) {
      setActiveIndex(Math.max(normalizedItems.length - 1, 0));
    }
  }, [activeIndex, normalizedItems.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [normalizedItems[0]?.clientId]);

  const activeItem = normalizedItems[activeIndex] ?? null;

  const hashtagLine = hashtags
    .map((tag) => `#${tag.replace(/^#/, "")}`)
    .join("  ");

  const showCta =
    ctaEnabled &&
    ctaButtonName.trim().length > 0 &&
    ctaButtonLink.trim().length > 0;

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

      <div className="relative aspect-square bg-[#F8FBFF]">
        {activeItem ? (
          <>
            <MediaSlide
              item={activeItem}
              objectUrl={objectUrls[activeItem.clientId] ?? null}
            />
            {normalizedItems.length > 1 ? (
              <>
                <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
                  {normalizedItems.map((item, index) => (
                    <span
                      key={item.clientId}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        index === activeIndex
                          ? "bg-white"
                          : "bg-white/50",
                      )}
                    />
                  ))}
                </div>
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="ml-2 h-8 w-8 rounded-full bg-white/90 p-0"
                    disabled={activeIndex === 0}
                    onClick={() => setActiveIndex((current) => current - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mr-2 h-8 w-8 rounded-full bg-white/90 p-0"
                    disabled={activeIndex >= normalizedItems.length - 1}
                    onClick={() => setActiveIndex((current) => current + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#647A9B]">
            Upload media to preview
          </div>
        )}
      </div>

      {showCta ? (
        <div className="border-b border-[#EEF4FB] px-3 py-3">
          <a
            href={ctaButtonLink.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white"
          >
            {ctaButtonName.trim()}
          </a>
        </div>
      ) : null}

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
          {caption.trim() || (
            <span className="text-[#647A9B]">Caption preview</span>
          )}
        </p>
        {hashtagLine ? (
          <p className="text-sm text-[#2563EB]">{hashtagLine}</p>
        ) : null}
      </div>
    </div>
  );
}
