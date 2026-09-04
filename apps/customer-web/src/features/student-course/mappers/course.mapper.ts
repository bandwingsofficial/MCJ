import type {
  StudentCourseResponseDto,
  CourseModuleResponseDto,
  LessonResponseDto,
} from "@/src/features/student-course/types/api.types";

import {
  CourseDurationType,
  CourseLevel,
  CourseStatus,
  type CourseBranch,
  type StudentCourse,
} from "@/src/features/student-course/types/course.types";

import type { CourseModule } from "@/src/features/student-course/types/module.types";
import type { Lesson } from "@/src/features/student-course/types/lesson.types";

export class CourseMapper {
  static toDomain(dto: StudentCourseResponseDto): StudentCourse {
    const modules = (dto.modules?.length ? dto.modules : dto.previewModules ?? [])
      .map(this.toModule)
      .sort((first, second) => first.displayOrder - second.displayOrder);

    return {
      id: dto.id,
      code: dto.code ?? "",
      title: dto.title,
      slug: dto.slug,
      tagline: dto.tagline,
      shortDescription: dto.shortDescription,
      description: dto.description,
      thumbnailUrl: dto.thumbnailUrl,
      duration: dto.duration,
      durationType: this.toDurationType(dto.durationType),
      level: this.toCourseLevel(dto.level),
      language: dto.language,
      averageRating: dto.averageRating,
      totalReviews: dto.totalReviews,
      isFeatured: dto.isFeatured,
      isPopular: dto.isPopular,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      metaKeywords: this.toKeywords(dto.metaKeywords),
      categoryId: dto.categoryId,
      branches: dto.branches.map(this.toBranch),
      status: this.toCourseStatus(dto.status),
      modules,
      moduleCount: dto.moduleCount ?? modules.length,
      lessonCount:
        dto.lessonCount ??
        modules.reduce((total, module) => total + module.lessons.length, 0),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  private static toBranch(
    dto: StudentCourseResponseDto["branches"][number],
  ): CourseBranch {
    return {
      id: dto.id,
      branchName: dto.branchName,
      branchCode: dto.branchCode,
    };
  }

  private static toModule(dto: CourseModuleResponseDto): CourseModule {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      keySkills: dto.keySkills,
      displayOrder: dto.displayOrder,
      lessons: dto.lessons
        .map(this.toLesson)
        .sort((first, second) => first.displayOrder - second.displayOrder),
    };
  }

  private static toLesson(dto: LessonResponseDto): Lesson {
    return {
      id: dto.id,
      title: dto.title,
      duration: dto.duration,
      displayOrder: dto.displayOrder,
    };
  }

  private static toKeywords(keywords: string): string[] {
    return keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
  }

  private static toCourseLevel(level: string): CourseLevel {
    switch (level) {
      case CourseLevel.BEGINNER:
        return CourseLevel.BEGINNER;
      case CourseLevel.INTERMEDIATE:
        return CourseLevel.INTERMEDIATE;
      case CourseLevel.ADVANCED:
        return CourseLevel.ADVANCED;
      default:
        return CourseLevel.BEGINNER;
    }
  }

  private static toCourseStatus(status: string): CourseStatus {
    switch (status) {
      case CourseStatus.ACTIVE:
        return CourseStatus.ACTIVE;
      case CourseStatus.DRAFT:
        return CourseStatus.DRAFT;
      case CourseStatus.INACTIVE:
        return CourseStatus.INACTIVE;
      case CourseStatus.ARCHIVED:
        return CourseStatus.ARCHIVED;
      default:
        return CourseStatus.DRAFT;
    }
  }

  private static toDurationType(type: string): CourseDurationType {
    switch (type) {
      case CourseDurationType.DAYS:
        return CourseDurationType.DAYS;
      case CourseDurationType.WEEKS:
        return CourseDurationType.WEEKS;
      case CourseDurationType.MONTHS:
        return CourseDurationType.MONTHS;
      case CourseDurationType.YEARS:
        return CourseDurationType.YEARS;
      default:
        return CourseDurationType.DAYS;
    }
  }
}
