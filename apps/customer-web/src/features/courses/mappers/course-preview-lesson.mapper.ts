import type {
  CoursePreviewLessonDetail,
  CoursePreviewLessonDetailDto,
  CoursePreviewLessonVideo,
  CoursePreviewLessonVideoDto,
} from "@/src/features/courses/types/course.types";

function mapPreviewVideo(
  dto: CoursePreviewLessonVideoDto,
): CoursePreviewLessonVideo {
  return {
    id: dto.id,
    title: dto.title,
    videoUrl: dto.videoUrl ?? null,
    contentType: dto.contentType,
    duration: dto.duration ?? null,
    displayOrder: dto.displayOrder,
    description: dto.description ?? null,
    recordedAt: dto.recordedAt ?? null,
  };
}

export function mergePreviewVideosFromDto(
  dto: Pick<
    CoursePreviewLessonDetailDto,
    "selfPacedVideos" | "liveRecordedVideos"
  >,
): CoursePreviewLessonVideo[] {
  return [...(dto.selfPacedVideos ?? []), ...(dto.liveRecordedVideos ?? [])]
    .map(mapPreviewVideo)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function selectFirstPreviewVideo(
  videos: CoursePreviewLessonVideo[],
): CoursePreviewLessonVideo | null {
  if (videos.length === 0) {
    return null;
  }

  return [...videos].sort((a, b) => a.displayOrder - b.displayOrder)[0] ?? null;
}

export function mapCoursePreviewLessonDetailDto(
  dto: CoursePreviewLessonDetailDto,
): CoursePreviewLessonDetail {
  const previewVideos = mergePreviewVideosFromDto(dto);

  return {
    id: dto.id,
    title: dto.title,
    displayOrder: dto.displayOrder,
    duration: dto.duration ?? null,
    isPreview: dto.isPreview,
    description: dto.description ?? null,
    previewVideos,
    previewVideo: selectFirstPreviewVideo(previewVideos),
  };
}
