import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { Student } from '../entities/student.entity';
import type { StudentRepository } from '../repositories/student.repository';

const PLACEHOLDER_STUDENT_EMAIL_SUFFIX = '@students.local';

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

    const emails = await this.resolveLookupEmails(userId, email);

    for (const candidate of emails) {
      const studentByEmail =
        await this.studentRepo.findByEmail(candidate);

      if (!studentByEmail) {
        continue;
      }

      await this.syncUserRelationship(studentByEmail, userId);

      return studentByEmail;
    }

    return null;
  }

  private async resolveLookupEmails(
    userId: string,
    email?: string | null,
  ): Promise<string[]> {
    const emails: string[] = [];
    const seen = new Set<string>();

    const add = (value?: string | null) => {
      const normalized = this.normalizeEmail(value);

      if (
        !normalized ||
        seen.has(normalized) ||
        normalized.endsWith(PLACEHOLDER_STUDENT_EMAIL_SUFFIX)
      ) {
        return;
      }

      seen.add(normalized);
      emails.push(normalized);
    };

    add(email);

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        email: true,
      },
    });

    add(user?.email);

    return emails;
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
