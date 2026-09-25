import { studentCourseApi } from "@/src/features/student-course/api/student-course.api";

import { CourseMapper } from "@/src/features/student-course/mappers/course.mapper";

import type { StudentCourseProgressDto } from "@/src/features/student-course/types/api.types";
import type { StudentCourseResponseDto } from "@/src/features/student-course/types/api.types";
import type { StudentCourse } from "@/src/features/student-course/types/course.types";

export interface StudentCourseWithProgress {
  course: StudentCourse;
  progress: StudentCourseProgressDto;
}

class StudentCourseService {
  async getCourse(courseId: string): Promise<StudentCourseWithProgress> {
    const response = await studentCourseApi.getCourse(courseId);
    const payload = response.data.data;

    const courseDto =
      payload &&
      typeof payload === "object" &&
      "course" in payload &&
      payload.course
        ? payload.course
        : payload;

    const progress =
      payload &&
      typeof payload === "object" &&
      "progress" in payload &&
      payload.progress
        ? payload.progress
        : {
            courseId,
            totalLessons: 0,
            completedLessons: 0,
            completionPercentage: 0,
            items: [],
          };

    return {
      course: CourseMapper.toDomain(courseDto as StudentCourseResponseDto),
      progress,
    };
  }
}

export const studentCourseService = new StudentCourseService();
