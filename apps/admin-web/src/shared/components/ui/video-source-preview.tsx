"use client";

import { getYouTubeEmbedUrl } from "@/src/shared/utils/youtube";

interface Props {
  url: string;
  youtubeVideoId?: string | null;
}

export function VideoSourcePreview({ url, youtubeVideoId }: Props) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const embedUrl =
    youtubeVideoId != null
      ? getYouTubeEmbedUrl(trimmed) ?? `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`
      : getYouTubeEmbedUrl(trimmed);

  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
        <iframe
          src={embedUrl}
          title="Video preview"
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
      <video
        key={trimmed}
        controls
        preload="metadata"
        className="aspect-video w-full"
        src={trimmed}
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}
