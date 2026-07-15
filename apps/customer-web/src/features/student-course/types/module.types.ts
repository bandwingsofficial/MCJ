import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

/**
 * Represents a learning module within a course.
 */
export interface CourseModule {
  /**
   * Unique module identifier.
   */
  id: string;

  /**
   * Module title displayed to the student.
   */
  title: string;

  /**
   * Optional module description.
   */
  description: string | null;

  /**
   * Key learning outcomes or skills covered
   * in this module.
   */
  keySkills: string[];

  /**
   * Module display order within the course.
   */
  displayOrder: number;

  /**
   * Lessons belonging to this module.
   * The mapper is responsible for ensuring
   * they are sorted by displayOrder.
   */
  lessons: Lesson[];
}