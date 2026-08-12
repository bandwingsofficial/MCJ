import { randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import {
  LessonProgressRecord,
  LessonProgressRepository,
} from '../../domain/repositories/lesson-progress.repository';

export class PrismaLessonProgressRepository
  implements LessonProgressRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<LessonProgressRecord[]> {
    const records = await this.prisma.lessonProgress.findMany({
      where: { studentId, courseId },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((record) => this.toRecord(record));
  }

  async findByStudentAndLesson(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgressRecord | null> {
    const record = await this.prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId,
          lessonId,
        },
      },
    });

    return record ? this.toRecord(record) : null;
  }

  async upsert(params: {
    studentId: string;
    courseId: string;
    lessonId: string;
    isCompleted?: boolean;
    watchedSeconds?: number;
  }): Promise<LessonProgressRecord> {
    const existing = await this.findByStudentAndLesson(
      params.studentId,
      params.lessonId,
    );

    const isCompleted =
      params.isCompleted ?? existing?.isCompleted ?? false;
    const watchedSeconds =
      params.watchedSeconds ?? existing?.watchedSeconds ?? 0;

    const record = await this.prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: params.studentId,
          lessonId: params.lessonId,
        },
      },
      create: {
        id: randomUUID(),
        studentId: params.studentId,
        courseId: params.courseId,
        lessonId: params.lessonId,
        isCompleted,
        watchedSeconds,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted,
        watchedSeconds,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return this.toRecord(record);
  }

  private toRecord(record: {
    id: string;
    studentId: string;
    courseId: string;
    lessonId: string;
    isCompleted: boolean;
    watchedSeconds: number;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): LessonProgressRecord {
    return {
      id: record.id,
      studentId: record.studentId,
      courseId: record.courseId,
      lessonId: record.lessonId,
      isCompleted: record.isCompleted,
      watchedSeconds: record.watchedSeconds,
      completedAt: record.completedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
