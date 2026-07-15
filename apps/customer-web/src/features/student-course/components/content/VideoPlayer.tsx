"use client";

import { useMemo } from "react";
import { PlayCircle } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface VideoPlayerProps {
  videoUrl: string | null;
}

function getYouTubeEmbedUrl(
  url: string,
): string | null {
  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.hostname.includes(
        "youtube.com",
      )
    ) {
      const videoId =
        parsedUrl.searchParams.get(
          "v",
        );

      if (!videoId) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (
      parsedUrl.hostname ===
      "youtu.be"
    ) {
      const videoId =
        parsedUrl.pathname.replace(
          "/",
          "",
        );

      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}

function isMp4(
  url: string,
): boolean {
  return (
    url
      .toLowerCase()
      .endsWith(".mp4")
  );
}

export function VideoPlayer({
  videoUrl,
}: VideoPlayerProps) {
  const embedUrl =
    useMemo(() => {
      if (!videoUrl) {
        return null;
      }

      return getYouTubeEmbedUrl(
        videoUrl,
      );
    }, [videoUrl]);

  if (!videoUrl) {
    return (
      <Card className="p-8">
        <EmptyState
          title="No Video Available"
          description="This lesson doesn't contain a video yet."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="aspect-video w-full bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Lesson Video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isMp4(
            videoUrl,
          ) ? (
          <video
            controls
            preload="metadata"
            className="h-full w-full"
          >
            <source
              src={videoUrl}
              type="video/mp4"
            />

            Your browser
            does not support
            HTML5 video.
          </video>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
            <PlayCircle className="h-16 w-16 opacity-70" />

            <p className="text-sm text-gray-300">
              Unsupported
              video provider
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}