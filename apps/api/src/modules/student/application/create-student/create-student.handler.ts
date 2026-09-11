import { randomBytes, randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { PasswordHasherPort } from '@modules/auth/application/ports/password-hasher.port';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Student } from '../../domain/entities/student.entity';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetStudentResult } from '../get-student/get-student.result';

import { CreateStudentCommand } from './create-student.command';

const STUDENT_UPLOAD_FOLDER = 'students';
const STUDENT_PROFILE_FILE_NAME = 'profile';

export class CreateStudentHandler {
  private readonly logger = new Logger(CreateStudentHandler.name);

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly domainService: StudentDomainService,
    private readonly uploadDomainService: UploadDomainService,
    private readonly prisma: PrismaService,
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: CreateStudentCommand): Promise<GetStudentResult> {
    if (command.branchId) {
      await this.domainService.ensureBranchExists(
        this.branchRepo,
        command.branchId,
      );
    }
    await this.domainService.ensureEmailIsAvailable(
      this.studentRepo,
      command.email,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.studentRepo,
      command.phone,
    );

    const studentCode =
      await this.domainService.generateUniqueStudentCode(this.studentRepo);

    const studentId = randomUUID();
    const userId = await this.createLinkedUserAccount(command);

    let profileImageFileId: string | null = null;
    let profileImageUrl: string | null = null;

    if (command.profileImageFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.profileImageFileId,
        folder: STUDENT_UPLOAD_FOLDER,
        entityId: studentId,
        fileName: STUDENT_PROFILE_FILE_NAME,
      });

      profileImageFileId = upload.id;
      profileImageUrl = upload.url;
    }

    const student = Student.create({
      id: studentId,
      userId,
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      phone: command.phone,
      gender: command.gender,
      dateOfBirth: command.dateOfBirth,
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2,
      city: command.city,
      state: command.state,
      country: command.country,
      postalCode: command.postalCode,
      profileImageFileId,
      profileImageUrl,
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      parentName: command.parentName,
      parentPhone: command.parentPhone,
      emergencyContactName: command.emergencyContactName,
      emergencyContactPhone: command.emergencyContactPhone,
      studentCode,
      admissionDate: command.admissionDate,
      branchId: command.branchId ?? null,
      notes: command.notes,
      status: command.status,
      createdBy: command.createdBy,
    });

    try {
      await this.studentRepo.save(student);
    } catch (error) {
      await this.prisma.user.delete({ where: { id: userId } }).catch(() => {
        // Best-effort cleanup if student save fails after user creation.
      });
      throw error;
    }

    this.logger.log(`✅ Student created: ${student.id}`);

    return GetStudentResult.fromEntity(student);
  }

  /**
   * Admin-created students need a User row (Student.userId is required),
   * but must NOT occupy the student's real email/phone on User.
   * Those remain on Student so the person can later register on
   * customer-web with the same email and be linked by identity match.
   */
  private async createLinkedUserAccount(
    command: CreateStudentCommand,
  ): Promise<string> {
    const email =
      command.email?.trim().toLowerCase() || null;

    if (email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
        select: { id: true },
      });

      if (existingEmail) {
        const linkedStudent = await this.studentRepo.findByUserId(
          existingEmail.id,
          true,
        );

        if (!linkedStudent) {
          return existingEmail.id;
        }

        throw new BaseException(
          ERROR_CODES.STUDENT_EMAIL_EXISTS,
          'A student with this email already exists. Use a different email address.',
          409,
          { field: 'email' },
        );
      }
    }

    const userId = randomUUID();
    const displayName = [command.firstName, command.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const placeholderEmail = `student-${userId.replace(/-/g, '')}@students.local`;
    const passwordHash = await this.passwordHasher.hash(
      randomBytes(32).toString('hex'),
    );

    try {
      await this.prisma.user.create({
        data: {
          id: userId,
          name: displayName || 'Student',
          email: placeholderEmail,
          phone: null,
          passwordHash,
          role: Role.STUDENT,
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002'
      ) {
        throw new BaseException(
          ERROR_CODES.STUDENT_EMAIL_EXISTS,
          'A student with this email already exists. Use a different email address.',
          409,
          { field: 'email' },
        );
      }
      throw error;
    }

    return userId;
  }
}
