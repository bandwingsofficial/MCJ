import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { Student } from '../entities/student.entity';
import type { StudentRepository } from '../repositories/student.repository';

@Injectable()
export class ResolveAuthenticatedStudentService {
  private readonly logger = new Logger(
    ResolveAuthenticatedStudentService.name,
  );

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findByAuthenticatedUser(
    userId: string,
    email?: string | null,
  ): Promise<Student | null> {
    const linkedStudent = await this.studentRepo.findByUserId(userId);

    if (linkedStudent) {
      return linkedStudent;
    }

    const normalizedEmail = await this.resolveEmail(userId, email);

    if (!normalizedEmail) {
      return null;
    }

    const studentByEmail =
      await this.studentRepo.findByEmail(normalizedEmail);

    if (!studentByEmail) {
      return null;
    }

    await this.syncUserRelationship(studentByEmail, userId);

    return studentByEmail;
  }

  private async resolveEmail(
    userId: string,
    email?: string | null,
  ): Promise<string | null> {
    const fromPayload = this.normalizeEmail(email);

    if (fromPayload) {
      return fromPayload;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        email: true,
      },
    });

    return this.normalizeEmail(user?.email);
  }

  private normalizeEmail(email?: string | null): string | null {
    const normalized = email?.trim().toLowerCase() || null;

    return normalized || null;
  }

  private async syncUserRelationship(
    student: Student,
    userId: string,
  ): Promise<void> {
    if (!student.linkToAuthenticatedUser(userId, userId)) {
      return;
    }

    try {
      await this.studentRepo.save(student);
      this.logger.log(
        `Linked existing student ${student.studentCode.getValue()} to authenticated user ${userId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not persist student user link for ${student.id}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }
  }
}
