import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import {
  CourseLessonPreviewResult,
  CourseLessonTreeResult,
  CourseModulePreviewResult,
  CourseModuleTreeResult,
  CourseResourcePreviewResult,
  CourseResourceTreeResult,
} from '../../application/get-course/get-course.result';

export interface CourseContentCounts {
  moduleCount: number;
  lessonCount: number;
  previewLessonCount: number;
}

@Injectable()
export class CourseHierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(
    courseId: string,
  ): Promise<CourseModuleTreeResult[]> {
    const modules = await this.loadModules(courseId);

    return modules.map((module) => this.toFullModule(module));
  }

  async getPreviewTree(
    courseId: string,
  ): Promise<CourseModulePreviewResult[]> {
    const modules = await this.loadModules(courseId);

    return modules.map((module) => this.toPreviewModule(module));
  }

  async getCourseCounts(
    courseId: string,
  ): Promise<CourseContentCounts> {
    const modules = await this.loadModules(courseId);
    const lessons = modules.flatMap((module) => module.lessons);

    return {
      moduleCount: modules.length,
      lessonCount: lessons.length,
      previewLessonCount: lessons.filter((lesson) => lesson.isPreview)
        .length,
    };
  }

  async getPreviewLesson(
    courseId: string,
    lessonId: string,
  ): Promise<CourseLessonPreviewResult | null> {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false,
        isPreview: true,
        module: {
          courseId,
          isDeleted: false,
        },
      },
    });

    if (!lesson) {
      return null;
    }

    return new CourseLessonPreviewResult(
      lesson.id,
      lesson.title,
      lesson.isPreview,
      lesson.duration,
      lesson.displayOrder,
      lesson.description,
      lesson.videoUrl,
    );
  }

  async getModuleTree(
    courseId: string,
    moduleId: string,
  ): Promise<CourseModuleTreeResult | null> {
    const module = await this.prisma.courseModule.findFirst({
      where: {
        id: moduleId,
        courseId,
        isDeleted: false,
      },
      include: {
        lessons: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
          include: {
            resources: {
              where: { isDeleted: false },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    return module ? this.toFullModule(module) : null;
  }

  async getLessonTree(
    courseId: string,
    lessonId: string,
  ): Promise<CourseLessonTreeResult | null> {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false,
        module: {
          courseId,
          isDeleted: false,
        },
      },
      include: {
        resources: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!lesson) {
      return null;
    }

    return this.toFullLesson(lesson);
  }

  async lessonBelongsToCourse(
    courseId: string,
    lessonId: string,
  ): Promise<boolean> {
    const lesson = await this.prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        isDeleted: false,
        module: {
          courseId,
          isDeleted: false,
        },
      },
      select: { id: true },
    });

    return Boolean(lesson);
  }

  async resourceBelongsToCourse(
    courseId: string,
    resourceId: string,
  ): Promise<boolean> {
    const resource = await this.prisma.courseResource.findFirst({
      where: {
        id: resourceId,
        isDeleted: false,
        lesson: {
          isDeleted: false,
          module: {
            courseId,
            isDeleted: false,
          },
        },
      },
      select: { id: true },
    });

    return Boolean(resource);
  }

  async getResource(
    resourceId: string,
  ): Promise<CourseResourceTreeResult | null> {
    const resource = await this.prisma.courseResource.findFirst({
      where: {
        id: resourceId,
        isDeleted: false,
      },
    });

    if (!resource) {
      return null;
    }

    return new CourseResourceTreeResult(
      resource.id,
      resource.title,
      resource.type,
      resource.fileUrl,
      resource.displayOrder,
    );
  }

  async softDeleteDescendants(
    courseId: string,
    deletedBy?: string | null,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const modules = await tx.courseModule.findMany({
        where: { courseId, isDeleted: false },
        select: { id: true },
      });

      const moduleIds = modules.map((module) => module.id);

      if (!moduleIds.length) {
        return;
      }

      const lessons = await tx.courseLesson.findMany({
        where: { moduleId: { in: moduleIds }, isDeleted: false },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length) {
        await tx.courseResource.updateMany({
          where: { lessonId: { in: lessonIds }, isDeleted: false },
          data: {
            isDeleted: true,
            deletedAt: now,
            deletedBy: deletedBy ?? null,
          },
        });
      }

      await tx.courseLesson.updateMany({
        where: { moduleId: { in: moduleIds }, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: deletedBy ?? null,
        },
      });

      await tx.courseModule.updateMany({
        where: { courseId, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: deletedBy ?? null,
        },
      });
    });
  }

  async restoreDescendants(courseId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const modules = await tx.courseModule.findMany({
        where: { courseId, isDeleted: true },
        select: { id: true },
      });

      const moduleIds = modules.map((module) => module.id);

      if (!moduleIds.length) {
        return;
      }

      const lessons = await tx.courseLesson.findMany({
        where: { moduleId: { in: moduleIds }, isDeleted: true },
        select: { id: true },
      });

      const lessonIds = lessons.map((lesson) => lesson.id);

      if (lessonIds.length) {
        await tx.courseResource.updateMany({
          where: { lessonId: { in: lessonIds }, isDeleted: true },
          data: { isDeleted: false, deletedAt: null, deletedBy: null },
        });
      }

      await tx.courseLesson.updateMany({
        where: { moduleId: { in: moduleIds }, isDeleted: true },
        data: { isDeleted: false, deletedAt: null, deletedBy: null },
      });

      await tx.courseModule.updateMany({
        where: { courseId, isDeleted: true },
        data: { isDeleted: false, deletedAt: null, deletedBy: null },
      });
    });
  }

  private async loadModules(courseId: string) {
    return this.prisma.courseModule.findMany({
      where: { courseId, isDeleted: false },
      orderBy: { displayOrder: 'asc' },
      include: {
        lessons: {
          where: { isDeleted: false },
          orderBy: { displayOrder: 'asc' },
          include: {
            resources: {
              where: { isDeleted: false },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  private toFullModule(
    module: Awaited<ReturnType<CourseHierarchyService['loadModules']>>[number],
  ): CourseModuleTreeResult {
    return new CourseModuleTreeResult(
      module.id,
      module.title,
      module.description,
      module.keySkills,
      module.displayOrder,
      module.lessons.map((lesson) => this.toFullLesson(lesson)),
    );
  }

  private toPreviewModule(
    module: Awaited<ReturnType<CourseHierarchyService['loadModules']>>[number],
  ): CourseModulePreviewResult {
    return new CourseModulePreviewResult(
      module.id,
      module.title,
      module.description,
      module.displayOrder,
      module.lessons.map(
        (lesson) =>
          new CourseLessonPreviewResult(
            lesson.id,
            lesson.title,
            lesson.isPreview,
            lesson.duration,
            lesson.displayOrder,
          ),
      ),
    );
  }

  private toFullLesson(
    lesson: Awaited<
      ReturnType<CourseHierarchyService['loadModules']>
    >[number]['lessons'][number],
  ): CourseLessonTreeResult {
    return new CourseLessonTreeResult(
      lesson.id,
      lesson.title,
      lesson.videoUrl,
      lesson.duration,
      lesson.displayOrder,
      lesson.isPreview,
      lesson.resources.map(
        (resource) =>
          new CourseResourceTreeResult(
            resource.id,
            resource.title,
            resource.type,
            resource.fileUrl,
            resource.displayOrder,
          ),
      ),
    );
  }
}
