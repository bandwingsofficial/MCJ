"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Loader2 } from "lucide-react";
import { VideoSourcePreview } from "@/src/shared/components/ui/video-source-preview";
import { formatVideoDurationHms } from "@/src/shared/utils/duration";

import type { CoursePreviewSelfPacedVideo } from "@/src/features/courses/types/course.types";

interface Props {
  videos: CoursePreviewSelfPacedVideo[];
  isLoading: boolean;
  errorMessage?: string | null;
}

export function CourseLessonPreviewPanel({
  videos,
  isLoading,
  errorMessage,
}: Props) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading preview…
      </div>
    );
  }

  if (errorMessage) {
    return (
      <p className="py-2 text-sm text-red-600">{errorMessage}</p>
    );
  }

  const sortedVideos = [...videos].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  if (sortedVideos.length === 0) {
    return (
      <p className="py-2 text-sm text-slate-500">
        No self-paced video is available for preview yet.
      </p>
    );
  }

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      {sortedVideos.map((video) => {
        const videoUrl = video.videoUrl?.trim() ?? "";
        const isActive = activeVideoId === video.id;
        const durationLabel = formatVideoDurationHms(video.duration);

        return (
          <div
            key={video.id}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2563D9]">
                  Self-Paced Video
                </p>
                <p className="mt-0.5 text-sm font-medium text-slate-900">
                  {video.title}
                </p>
                {durationLabel ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Duration: {durationLabel}
                  </p>
                ) : null}
              </div>

              {videoUrl ? (
                <Button
                  type="button"
                  size="sm"
                  variant={isActive ? "secondary" : "outline"}
                  className="shrink-0"
                  onClick={() => {
                    setActiveVideoId(isActive ? null : video.id);
                  }}
                >
                  {isActive ? "Hide Preview" : "Watch Preview"}
                </Button>
              ) : (
                <span className="text-xs text-amber-700">
                  Video unavailable
                </span>
              )}
            </div>

            {isActive && videoUrl ? (
              <div className="mt-3">
                <VideoSourcePreview url={videoUrl} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
