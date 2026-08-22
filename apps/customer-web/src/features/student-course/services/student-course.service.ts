import { studentCourseApi } from "@/src/features/student-course/api/student-course.api";

import { CourseMapper } from "@/src/features/student-course/mappers/course.mapper";

import type { StudentCourse } from "@/src/features/student-course/types/course.types";
import type { StudentCourseProgressDto } from "@/src/features/student-course/types/api.types";

export interface StudentCourseWithProgress {
  course: StudentCourse;
  progress: StudentCourseProgressDto;
}

class StudentCourseService {
  async getCourse(courseId: string): Promise<StudentCourseWithProgress> {
    const response = await studentCourseApi.getCourse(courseId);
    const payload = response.data.data;

    return {
      course: CourseMapper.toDomain(payload.course),
      progress: payload.progress,
    };
  }
}

export const studentCourseService = new StudentCourseService();
