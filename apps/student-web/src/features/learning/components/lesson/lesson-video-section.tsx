"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { LessonVideoPlayer } from "@/src/features/learning/components/lesson/lesson-content-panels";
import type { LearningContentMode } from "@/src/features/learning/types/learning.types";
import {
  formatVideoDuration,
  type PlayableLessonVideo,
} from "@/src/features/learning/utils/learning-mode-navigation.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

interface LessonVideoSectionProps {
  mode: LearningContentMode;
  videos: PlayableLessonVideo[];
  currentVideo: PlayableLessonVideo | null;
  currentIndex: number;
  watchedSeconds: number;
  onTimeUpdate: (seconds: number) => void;
  onPreviousVideo: () => void;
  onNextVideo: () => void;
}

export function LessonVideoSection({
  mode,
  videos,
  currentVideo,
  currentIndex,
  watchedSeconds,
  onTimeUpdate,
  onPreviousVideo,
  onNextVideo,
}: LessonVideoSectionProps) {
  const emptyTitle =
    mode === "live_recorded"
      ? "No recorded video yet"
      : "No self-paced video yet";
  const emptyDescription =
    mode === "live_recorded"
      ? "There is no live recorded video for this lesson in your batch yet."
      : "This lesson does not include a self-paced video. Use Resources, Learn, or Quiz for this lesson.";

  if (!currentVideo) {
    return (
      <Card className="rounded-xl border border-dashed border-slate-200 p-6">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  const totalVideos = videos.length;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalVideos - 1;
  const durationLabel = formatVideoDuration(currentVideo.duration);

  return (
    <section className="space-y-3">
      <LessonVideoPlayer
        key={currentVideo.id}
        videoUrl={currentVideo.videoUrl}
        watchedSeconds={watchedSeconds}
        onTimeUpdate={onTimeUpdate}
      />

      <div className="space-y-1 pt-1">
        <h3 className="text-base font-semibold text-[#0B1F3A]">
          {currentVideo.title}
        </h3>
        {durationLabel ? (
          <p className="text-sm text-slate-600">Duration: {durationLabel}</p>
        ) : null}
      </div>

      {totalVideos > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-[7.5rem] rounded-lg"
            disabled={!hasPrevious}
            onClick={onPreviousVideo}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <p className="shrink-0 text-center text-xs font-medium text-slate-600 sm:text-sm">
            Video {currentIndex + 1} of {totalVideos}
          </p>

          <Button
            type="button"
            variant={hasNext ? "primary" : "outline"}
            size="sm"
            className="min-w-[7.5rem] rounded-lg"
            disabled={!hasNext}
            onClick={onNextVideo}
          >
            Next Video
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
