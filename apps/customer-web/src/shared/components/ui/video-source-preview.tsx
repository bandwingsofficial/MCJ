"use client";

import { getYouTubeEmbedUrl } from "@/src/shared/utils/youtube";

interface Props {
  url: string;
  youtubeVideoId?: string | null;
  autoPlay?: boolean;
}

export function VideoSourcePreview({
  url,
  youtubeVideoId,
  autoPlay = false,
}: Props) {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  const embedUrl =
    youtubeVideoId != null
      ? getYouTubeEmbedUrl(trimmed) ??
        `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`
      : getYouTubeEmbedUrl(trimmed);

  const wrapperClassName =
    "relative w-full overflow-hidden rounded-xl border border-slate-200 bg-black aspect-video";

  if (embedUrl) {
    const src = autoPlay
      ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`
      : embedUrl;

    return (
      <div className={wrapperClassName}>
        <iframe
          src={src}
          title="Video preview"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <video
        key={trimmed}
        controls
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-contain"
        src={trimmed}
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}
