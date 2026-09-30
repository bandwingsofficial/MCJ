"use client";

import { Loader2 } from "lucide-react";

import { VideoSourcePreview } from "@/src/shared/components/ui/video-source-preview";
import { formatVideoDurationHms } from "@/src/shared/utils/duration";

import type { CoursePreviewLessonVideo } from "@/src/features/courses/types/course.types";
import {
  formatRecordedSessionDate,
  previewVideoTypeLabel,
} from "@/src/features/courses/utils/lesson-preview.utils";

interface Props {
  previewVideo: CoursePreviewLessonVideo | null;
  isLoading: boolean;
  errorMessage?: string | null;
  isOpen: boolean;
}

export function CourseLessonPreviewPanel({
  previewVideo,
  isLoading,
  errorMessage,
  isOpen,
}: Props) {
  if (!isOpen) {
    return null;
  }

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

  if (!previewVideo) {
    return null;
  }

  const videoUrl = previewVideo.videoUrl?.trim() ?? "";
  const durationLabel = formatVideoDurationHms(previewVideo.duration);
  const typeLabel = previewVideoTypeLabel(previewVideo.contentType);
  const sessionDateLabel = formatRecordedSessionDate(previewVideo.recordedAt);

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#2563D9]">
          Video · {typeLabel}
        </p>
        <p className="mt-0.5 text-sm font-medium text-slate-900">
          {previewVideo.title}
        </p>
        {sessionDateLabel ? (
          <p className="mt-1 text-xs text-slate-500">
            Session Date: {sessionDateLabel}
          </p>
        ) : null}
        {durationLabel ? (
          <p className="mt-1 text-xs text-slate-500">
            Duration: {durationLabel}
          </p>
        ) : null}

        {videoUrl ? (
          <div className="mt-3 w-full min-w-0">
            <VideoSourcePreview url={videoUrl} autoPlay />
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-700">Video unavailable</p>
        )}
      </div>
    </div>
  );
}
