import type {
  CoursePreviewLessonDetail,
  CoursePreviewLessonDetailDto,
  CoursePreviewSelfPacedVideo,
  CoursePreviewSelfPacedVideoDto,
} from "@/src/features/courses/types/course.types";

function mapSelfPacedVideo(
  dto: CoursePreviewSelfPacedVideoDto,
): CoursePreviewSelfPacedVideo {
  return {
    id: dto.id,
    title: dto.title,
    videoUrl: dto.videoUrl ?? null,
    contentType: dto.contentType,
    duration: dto.duration ?? null,
    displayOrder: dto.displayOrder,
    description: dto.description ?? null,
  };
}

export function mapCoursePreviewLessonDetailDto(
  dto: CoursePreviewLessonDetailDto,
): CoursePreviewLessonDetail {
  return {
    id: dto.id,
    title: dto.title,
    displayOrder: dto.displayOrder,
    duration: dto.duration ?? null,
    isPreview: dto.isPreview,
    description: dto.description ?? null,
    selfPacedVideos: (dto.selfPacedVideos ?? []).map(mapSelfPacedVideo),
  };
}
