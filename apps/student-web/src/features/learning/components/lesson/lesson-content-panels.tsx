"use client";

import { useMemo } from "react";
import { Download, FileText, Link2, PlayCircle } from "lucide-react";

import { learningService } from "@/src/features/learning/services/learning.service";
import type { LessonResourceDto } from "@/src/features/learning/types/learning.types";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

interface LessonVideoPlayerProps {
  videoUrl: string | null;
  watchedSeconds?: number;
  onTimeUpdate?: (seconds: number) => void;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (parsedUrl.hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isMp4(url: string): boolean {
  return url.toLowerCase().endsWith(".mp4");
}

export function LessonVideoPlayer({
  videoUrl,
  watchedSeconds = 0,
  onTimeUpdate,
}: LessonVideoPlayerProps) {
  const embedUrl = useMemo(
    () => (videoUrl ? getYouTubeEmbedUrl(videoUrl) : null),
    [videoUrl],
  );

  if (!videoUrl) {
    return (
      <Card className="rounded-2xl border border-slate-200 p-8">
        <EmptyState
          title="No video available"
          description="This lesson does not include a video yet."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-200 p-0">
      <div className="aspect-video w-full bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title="Lesson video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isMp4(videoUrl) ? (
          <video
            controls
            preload="metadata"
            className="h-full w-full"
            onTimeUpdate={(event) => {
              onTimeUpdate?.(Math.floor(event.currentTarget.currentTime));
            }}
            onLoadedMetadata={(event) => {
              if (watchedSeconds > 0) {
                event.currentTarget.currentTime = watchedSeconds;
              }
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
            <PlayCircle className="h-16 w-16 opacity-70" />
            <p className="text-sm text-slate-300">Unsupported video provider</p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface LessonResourcesListProps {
  resources: LessonResourceDto[];
  courseId: string;
}

interface LessonTextContentProps {
  description: string | null;
  contentType: string;
}

export function LessonTextContent({
  description,
  contentType,
}: LessonTextContentProps) {
  if (!description?.trim()) {
    return (
      <Card className="rounded-xl border border-slate-200 p-8">
        <EmptyState
          title="No lesson content"
          description={`This ${contentType.toLowerCase()} topic does not have written content yet.`}
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-slate-200 p-6">
      <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700">
        <p className="whitespace-pre-wrap">{description}</p>
      </div>
    </Card>
  );
}

export function LessonResourcesList({
  resources,
  courseId,
}: LessonResourcesListProps) {
  if (resources.length === 0) {
    return (
      <EmptyState
        title="No resources"
        description="Learning materials for this lesson will appear here when available."
      />
    );
  }

  return (
    <div className="space-y-3">
      {resources
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((resource) => (
          <Card
            key={resource.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#F8FBFF] p-2 text-[#2563EB]">
                {resource.type.toLowerCase().includes("link") ? (
                  <Link2 className="h-4 w-4" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-[#0B1F3A]">{resource.title}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {resource.type}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={async () => {
                const download = await learningService.downloadResource(
                  resource.id,
                  courseId,
                );
                window.open(download.fileUrl, "_blank", "noopener,noreferrer");
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Open
            </Button>
          </Card>
        ))}
    </div>
  );
}
