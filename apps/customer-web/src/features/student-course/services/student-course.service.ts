import { studentCourseApi } from "@/src/features/student-course/api/student-course.api";

import { CourseMapper } from "@/src/features/student-course/mappers/course.mapper";

import type {
  StudentCourse,
} from "@/src/features/student-course/types/course.types";

class StudentCourseService {
  /**
   * Fetches an enrolled course and converts the
   * backend DTO into the frontend domain model.
   */
  async getCourse(
    courseId: string,
  ): Promise<StudentCourse> {
    const response =
      await studentCourseApi.getCourse(
        courseId,
      );

    return CourseMapper.toDomain(
      response.data.data,
    );
  }
}

export const studentCourseService =
  new StudentCourseService();