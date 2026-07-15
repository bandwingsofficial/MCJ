import type {
  LessonResource,
} from "@/src/features/student-course/types/resource.types";

/**
 * Represents a single lesson inside a course module.
 */
export interface Lesson {
  /**
   * Unique lesson identifier.
   */
  id: string;

  /**
   * Lesson title.
   */
  title: string;

  /**
   * Video URL for the lesson.
   * Can be YouTube, Vimeo, signed URL, etc.
   */
  videoUrl: string | null;

  /**
   * Lesson duration in seconds.
   * Null when the backend has not calculated it yet.
   */
  duration: number | null;

  /**
   * Lesson ordering within the module.
   */
  displayOrder: number;

  /**
   * Learning resources attached to this lesson.
   */
  resources: LessonResource[];
}