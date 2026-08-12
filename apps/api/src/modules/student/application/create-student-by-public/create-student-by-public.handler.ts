import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { CreateProfileCommand } from '@modules/profile/application/create-profile/create-profile.command';
import { CreateProfileHandler } from '@modules/profile/application/create-profile/create-profile.handler';
import type { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { Student } from '../../domain/entities/student.entity';
import { StudentStatus } from '../../domain/enums/student-status.enum';
import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetMyStudentResult } from '../get-my-student/get-my-student.result';
import {
  extractPersonalFieldsFromProfile,
  toProfileGender,
} from '../shared/student-personal-fields.mapper';

import { CreateStudentByPublicCommand } from './create-student-by-public.command';

export interface CreateStudentByPublicHandlerResult {
  result: GetMyStudentResult;
  alreadyExists: boolean;
}

export class CreateStudentByPublicHandler {
  private readonly logger = new Logger(
    CreateStudentByPublicHandler.name,
  );

  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly domainService: StudentDomainService,
    private readonly createProfileHandler: CreateProfileHandler,
  ) {}

  async execute(
    command: CreateStudentByPublicCommand,
  ): Promise<CreateStudentByPublicHandlerResult> {
    const userId = command.createdBy;

    let profile = await this.profileRepo.findByUserId(userId);

    if (!profile) {
      this.ensurePersonalFieldsProvided(command);

      await this.createProfileHandler.execute(
        new CreateProfileCommand(
          userId,
          command.firstName,
          command.lastName,
          command.email,
          command.phone,
          toProfileGender(command.gender),
          command.dateOfBirth,
          undefined,
          command.addressLine1,
          command.addressLine2,
          command.city,
          command.state,
          command.country,
          command.postalCode,
        ),
      );

      profile = await this.profileRepo.findByUserId(userId);
    }

    if (!profile) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Profile could not be created',
        400,
      );
    }

    const existingStudent =
      await this.studentRepo.findByCreatedBy(userId);

    if (existingStudent) {
      return {
        result: GetMyStudentResult.fromStudent(existingStudent),
        alreadyExists: true,
      };
    }

    const personal = extractPersonalFieldsFromProfile(profile);

    await this.domainService.ensureEmailIsAvailable(
      this.studentRepo,
      personal.email,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.studentRepo,
      personal.phone,
    );

    const branchId =
      await this.domainService.resolveDefaultBranchId(
        this.branchRepo,
      );
    const studentCode =
      await this.domainService.generateUniqueStudentCode(
        this.studentRepo,
      );

    const student = Student.create({
      id: randomUUID(),
      userId,
      firstName: personal.firstName,
      lastName: personal.lastName,
      email: personal.email,
      phone: personal.phone,
      gender: personal.gender,
      dateOfBirth: personal.dateOfBirth,
      addressLine1: personal.addressLine1,
      addressLine2: personal.addressLine2,
      city: personal.city,
      state: personal.state,
      country: personal.country,
      postalCode: personal.postalCode,
      profileImageUrl: personal.profileImageUrl,
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      parentName: command.parentName,
      parentPhone: command.parentPhone,
      emergencyContactName: command.emergencyContactName,
      emergencyContactPhone: command.emergencyContactPhone,
      studentCode,
      branchId,
      notes: command.notes,
      status: StudentStatus.LEAD,
      isActive: true,
      createdBy: userId,
    });

    await this.studentRepo.save(student);

    this.logger.log(
      `✅ Public student profile created: ${student.id}`,
    );

    return {
      result: GetMyStudentResult.fromStudent(student),
      alreadyExists: false,
    };
  }

  private ensurePersonalFieldsProvided(
    command: CreateStudentByPublicCommand,
  ): void {
    if (!command.firstName?.trim()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'First name is required when profile does not exist',
        400,
      );
    }
  }
}
