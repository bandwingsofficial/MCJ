"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  portalCommunityService,
  type PortalCommunityPost,
  getPortalCommunityErrorMessage,
} from "@/src/features/community/services/portal-community.service";
import { buildCommunityPostShareUrl } from "@/src/features/community/utils/community-share-url";

interface Props {
  postId: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function resolvePrimaryMedia(post: PortalCommunityPost) {
  const fromGallery =
    post.media.find((item) => item.isPrimary) ?? post.media[0] ?? null;
  const src =
    fromGallery?.url ?? post.thumbnailUrl ?? post.mediaUrl ?? null;
  const type = fromGallery?.mediaType ?? post.type;
  return { src, type };
}

export function CommunityPostPage({ postId }: Props) {
  const [post, setPost] = useState<PortalCommunityPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const loadPost = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await portalCommunityService.getPost(postId);
      setPost(data);

      const viewResult = await portalCommunityService.recordView(postId);
      setPost((current) =>
        current
          ? { ...current, viewCount: viewResult.viewCount }
          : current,
      );
    } catch (err) {
      setError(getPortalCommunityErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  const media = useMemo(
    () => (post ? resolvePrimaryMedia(post) : null),
    [post],
  );

  const handleShare = async () => {
    if (!post) {
      return;
    }

    setIsSharing(true);
    try {
      const shareResult = await portalCommunityService.recordShare(post.id);
      const shareUrl = buildCommunityPostShareUrl(post.id);
      const title = post.authorName || "MCJ Community";
      const text =
        post.caption?.trim() ||
        "Check out this post on MCJ Community";

      setPost((current) =>
        current
          ? { ...current, shareCount: shareResult.shareCount }
          : current,
      );

      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        appToast.success("Post link copied");
      }
    } catch (err) {
      const message = getPortalCommunityErrorMessage(err);
      if (!message.toLowerCase().includes("abort")) {
        appToast.error(message);
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !post) {
    return (
      <ErrorState
        title="Unable to load post"
        description={error ?? "Post not found"}
        onRetry={() => {
          void loadPost();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="overflow-hidden border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">{post.authorName}</p>
          <p className="text-xs text-slate-500">{formatDate(post.createdAt)}</p>
        </div>

        {media?.src ? (
          <div className="aspect-square bg-slate-50">
            {media.type === "VIDEO" ? (
              <video
                src={media.src}
                className="h-full w-full object-cover"
                controls
                playsInline
              />
            ) : (
              <img
                src={media.src}
                alt={post.caption ?? "Community post"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ) : null}

        <div className="space-y-3 px-4 py-4">
          {post.caption ? (
            <p className="whitespace-pre-wrap text-sm text-slate-800">
              {post.caption}
            </p>
          ) : null}

          {post.hashtags.length > 0 ? (
            <p className="text-sm text-blue-600">
              {post.hashtags
                .map((tag) => `#${tag.replace(/^#/, "")}`)
                .join(" ")}
            </p>
          ) : null}

          {post.location ? (
            <p className="text-xs text-slate-500">{post.location}</p>
          ) : null}

          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <span>{post.viewCount} views</span>
            <span>{post.likeCount} likes</span>
            <span>{post.commentCount} comments</span>
            <span>{post.shareCount} shares</span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSharing}
            onClick={() => {
              void handleShare();
            }}
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden />
            Share post
          </Button>
        </div>
      </Card>
    </div>
  );
}
