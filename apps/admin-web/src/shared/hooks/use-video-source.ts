"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";
import {
  getVideoDurationFromFile,
  getVideoDurationFromUrl,
} from "@/src/shared/utils/video-duration";
import {
  getYouTubeVideoDuration,
} from "@/src/shared/utils/youtube-iframe-api";
import {
  isDirectVideoUrl,
  isValidHttpUrl,
  isYouTubeUrl,
  parseYouTubeVideoId,
} from "@/src/shared/utils/youtube";

export type VideoSourceKind = "upload" | "youtube" | "direct-url" | null;

interface Options {
  videoUrl: string;
  uploadedVideoUrl: string;
  uploadedFile: File | null;
  enabled: boolean;
  touched: boolean;
  showValidation: boolean;
}

interface Result {
  effectiveUrl: string;
  sourceKind: VideoSourceKind;
  youtubeVideoId: string | null;
  previewState: FieldVisualState;
  previewError: string | null;
  previewSuccessMessage: string | null;
  durationSeconds: number | null;
  durationState: FieldVisualState;
  durationError: string | null;
  isResolvingSource: boolean;
}

export function useVideoSource({
  videoUrl,
  uploadedVideoUrl,
  uploadedFile,
  enabled,
  touched,
  showValidation,
}: Options): Result {
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSuccessMessage, setPreviewSuccessMessage] = useState<
    string | null
  >(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [durationError, setDurationError] = useState<string | null>(null);
  const [isResolvingSource, setIsResolvingSource] = useState(false);
  const requestIdRef = useRef(0);

  const trimmedUploadUrl = uploadedVideoUrl.trim();
  const trimmedVideoUrl = videoUrl.trim();

  const sourceKind = useMemo((): VideoSourceKind => {
    if (trimmedUploadUrl) {
      return "upload";
    }
    if (!trimmedVideoUrl) {
      return null;
    }
    if (isYouTubeUrl(trimmedVideoUrl)) {
      return "youtube";
    }
    return "direct-url";
  }, [trimmedUploadUrl, trimmedVideoUrl]);

  const effectiveUrl = trimmedUploadUrl || trimmedVideoUrl;
  const youtubeVideoId =
    sourceKind === "youtube" ? parseYouTubeVideoId(trimmedVideoUrl) : null;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setPreviewError(null);
    setPreviewSuccessMessage(null);
    setDurationError(null);
    setDurationSeconds(null);

    const hasUpload = Boolean(trimmedUploadUrl);
    const hasUrl = Boolean(trimmedVideoUrl);
    const hasLocalFile = Boolean(uploadedFile);

    if (!hasUpload && !hasUrl && !hasLocalFile) {
      setIsResolvingSource(false);
      return;
    }

    setIsResolvingSource(true);

    const finish = () => {
      if (requestId === requestIdRef.current) {
        setIsResolvingSource(false);
      }
    };

    const resolveDuration = async () => {
      try {
        if (hasUpload) {
          await resolveUploadedSource(trimmedUploadUrl, uploadedFile, requestId);
          return;
        }

        if (hasLocalFile && uploadedFile) {
          const seconds = await getVideoDurationFromFile(uploadedFile);
          if (requestId !== requestIdRef.current) {
            return;
          }
          setDurationSeconds(seconds);
          setPreviewSuccessMessage("Video file ready for preview.");
          return;
        }

        if (!hasUrl) {
          return;
        }

        if (!isValidHttpUrl(trimmedVideoUrl)) {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setPreviewError("Enter a valid video URL.");
          return;
        }

        const ytId = parseYouTubeVideoId(trimmedVideoUrl);
        if (ytId) {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setPreviewSuccessMessage("YouTube video recognized.");
          const seconds = await getYouTubeVideoDuration(ytId);
          if (requestId !== requestIdRef.current) {
            return;
          }
          setDurationSeconds(seconds);
          return;
        }

        if (!isDirectVideoUrl(trimmedVideoUrl)) {
          if (requestId !== requestIdRef.current) {
            return;
          }
          setPreviewError(
            "Enter a YouTube URL or a direct video file URL (.mp4, .webm, .mov).",
          );
          return;
        }

        const seconds = await getVideoDurationFromUrl(trimmedVideoUrl);
        if (requestId !== requestIdRef.current) {
          return;
        }
        setDurationSeconds(seconds);
        setPreviewSuccessMessage("Video URL recognized.");
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Could not load the selected video source.";
        setPreviewError(message);
        setDurationError(message);
      } finally {
        finish();
      }
    };

    void resolveDuration();

    return () => {
      requestIdRef.current += 1;
    };
  }, [
    enabled,
    trimmedUploadUrl,
    trimmedVideoUrl,
    uploadedFile,
  ]);

  async function resolveUploadedSource(
    url: string,
    file: File | null,
    requestId: number,
  ) {
    setPreviewSuccessMessage("Video uploaded successfully.");

    if (file) {
      const seconds = await getVideoDurationFromFile(file);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setDurationSeconds(seconds);
      return;
    }

    const seconds = await getVideoDurationFromUrl(url);
    if (requestId !== requestIdRef.current) {
      return;
    }
    setDurationSeconds(seconds);
  }

  const showFieldValidation = touched || showValidation;
  const hasSource = Boolean(effectiveUrl || uploadedFile);

  let previewState: FieldVisualState = "neutral";
  if (showFieldValidation || (hasSource && isResolvingSource)) {
    if (isResolvingSource) {
      previewState = "checking";
    } else if (previewError) {
      previewState = "invalid";
    } else if (effectiveUrl || uploadedFile) {
      previewState = "valid";
    } else if (showFieldValidation && !hasSource) {
      previewState = "invalid";
    }
  }

  let durationState: FieldVisualState = "neutral";
  if (showFieldValidation || durationSeconds != null || isResolvingSource) {
    if (isResolvingSource && !durationSeconds) {
      durationState = "checking";
    } else if (durationError) {
      durationState = "invalid";
    } else if (durationSeconds != null && durationSeconds > 0) {
      durationState = "valid";
    } else if (showFieldValidation && hasSource && !isResolvingSource) {
      durationState = "invalid";
    }
  }

  return {
    effectiveUrl,
    sourceKind,
    youtubeVideoId,
    previewState,
    previewError:
      previewError ??
      (showFieldValidation && !hasSource
        ? "Upload a video or provide a video URL."
        : null),
    previewSuccessMessage,
    durationSeconds,
    durationState,
    durationError:
      durationError ??
      (showFieldValidation &&
      hasSource &&
      !isResolvingSource &&
      (!durationSeconds || durationSeconds <= 0)
        ? "Video duration must be detected before saving."
        : null),
    isResolvingSource,
  };
}
