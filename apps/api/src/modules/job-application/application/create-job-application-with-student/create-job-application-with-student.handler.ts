import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import type { JobRepository } from '@modules/job/domain/repositories/job.repository';
import { JobDomainService } from '@modules/job/domain/services/job-domain.service';
import { CreateProfileCommand } from '@modules/profile/application/create-profile/create-profile.command';
import { CreateProfileHandler } from '@modules/profile/application/create-profile/create-profile.handler';
import type { ProfileRepository } from '@modules/profile/domain/repositories/profile.repository';
import { Student } from '@modules/student/domain/entities/student.entity';
import { StudentJobStatus } from '@modules/student/domain/enums/student-job-status.enum';
import { StudentStatus } from '@modules/student/domain/enums/student-status.enum';
import type { StudentRepository } from '@modules/student/domain/repositories/student.repository';
import { StudentDomainService } from '@modules/student/domain/services/student-domain.service';
import { UploadFileCommand } from '@modules/uploads/application/upload-file/upload-file.command';
import { UploadFileHandler } from '@modules/uploads/application/upload-file/upload-file.handler';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';
import { toProfileGender } from '@modules/student/application/shared/student-personal-fields.mapper';

import { JobApplication } from '../../domain/entities/job-application.entity';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { CreateJobApplicationWithStudentCommand } from './create-job-application-with-student.command';

const ALLOWED_RESUME_MIME_TYPES = new Set(['application/pdf']);

export class CreateJobApplicationWithStudentHandler {
  private readonly logger = new Logger(
    CreateJobApplicationWithStudentHandler.name,
  );

  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly jobRepo: JobRepository,
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly profileRepo: ProfileRepository,
    private readonly jobDomainService: JobDomainService,
    private readonly studentDomainService: StudentDomainService,
    private readonly applicationDomainService: JobApplicationDomainService,
    private readonly createProfileHandler: CreateProfileHandler,
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateJobApplicationWithStudentCommand,
  ): Promise<GetJobApplicationResult> {
    const job = this.jobDomainService.ensureExists(
      await this.jobRepo.findBySlug(command.slug),
    );

    this.jobDomainService.ensureAcceptingApplications(job);

    this.assertResume(command.resume);

    const normalizedEmail = this.normalizeEmail(command.email);
    const existingStudentByEmail =
      await this.studentRepo.findByEmail(normalizedEmail);

    if (existingStudentByEmail) {
      await this.applicationDomainService.ensureNotDuplicate(
        this.applicationRepo,
        job.id,
        existingStudentByEmail.id,
      );
    } else {
      const existingStudentByUser = await this.studentRepo.findByUserId(
        command.userId,
      );

      if (existingStudentByUser) {
        await this.applicationDomainService.ensureNotDuplicate(
          this.applicationRepo,
          job.id,
          existingStudentByUser.id,
        );
      }
    }

    const student = existingStudentByEmail
      ? await this.updateStudentFromApplication(
          existingStudentByEmail,
          command,
        )
      : await this.createOrUpdateStudentForNewEmail(command, normalizedEmail);

    const applicationId = randomUUID();
    const applicationNumber =
      await this.applicationRepo.nextApplicationNumber();

    const uploaded = await this.uploadFileHandler.execute(
      new UploadFileCommand(
        command.resume,
        'jobs',
        command.resume.originalname,
        job.id,
        undefined,
        undefined,
        undefined,
      ),
    );

    const attached = await this.uploadDomainService.attachToEntity({
      uploadId: uploaded.fileId,
      folder: 'jobs',
      entityId: job.id,
      subFolder: 'applications',
      fileName: `${applicationId}-${command.resume.originalname}`,
    });

    const applicantName = [command.firstName, command.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const currentLocation = [command.city, command.state]
      .filter(Boolean)
      .join(', ');

    const application = JobApplication.create({
      id: applicationId,
      jobId: job.id,
      studentId: student.id,
      applicationNumber,
      applicantName,
      applicantEmail: normalizedEmail,
      applicantPhone: command.phone,
      highestQualification: command.qualification,
      resumeFileId: attached.id,
      currentLocation,
      remarks: this.buildRemarks(command),
      createdBy: command.userId,
    });

    await this.applicationRepo.save(application);

    this.logger.log(
      `Job application with student linked: ${application.applicationNumber} / ${student.studentCode.getValue()}`,
    );

    return this.applicationDomainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(application.id),
    );
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async createOrUpdateStudentForNewEmail(
    command: CreateJobApplicationWithStudentCommand,
    normalizedEmail: string,
  ): Promise<Student> {
    await this.ensureProfile(command);

    const existingStudentByUser = await this.studentRepo.findByUserId(
      command.userId,
    );

    if (existingStudentByUser) {
      return this.updateStudentFromApplication(
        existingStudentByUser,
        command,
        normalizedEmail,
      );
    }

    return this.createStudent(command, normalizedEmail);
  }

  private async ensureProfile(
    command: CreateJobApplicationWithStudentCommand,
  ): Promise<void> {
    const profile = await this.profileRepo.findByUserId(command.userId);

    if (profile) {
      return;
    }

    await this.createProfileHandler.execute(
      new CreateProfileCommand(
        command.userId,
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
  }

  private async createStudent(
    command: CreateJobApplicationWithStudentCommand,
    normalizedEmail: string,
  ): Promise<Student> {
    await this.studentDomainService.ensureEmailIsAvailable(
      this.studentRepo,
      normalizedEmail,
    );
    await this.studentDomainService.ensurePhoneIsAvailable(
      this.studentRepo,
      command.phone,
    );

    const branchId =
      await this.studentDomainService.resolveDefaultBranchId(
        this.branchRepo,
      );
    const studentCode =
      await this.studentDomainService.generateUniqueStudentCode(
        this.studentRepo,
      );

    const student = Student.create({
      id: randomUUID(),
      userId: command.userId,
      firstName: command.firstName,
      lastName: command.lastName?.trim() || null,
      email: normalizedEmail,
      phone: command.phone,
      gender: command.gender,
      dateOfBirth: command.dateOfBirth,
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2,
      city: command.city,
      state: command.state,
      country: command.country,
      postalCode: command.postalCode,
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      studentCode,
      branchId,
      status: StudentStatus.LEAD,
      jobStatus: StudentJobStatus.JOB_APPLIED,
      isActive: true,
      createdBy: command.userId,
    });

    await this.studentRepo.save(student);

    return student;
  }

  private async updateStudentFromApplication(
    student: Student,
    command: CreateJobApplicationWithStudentCommand,
    normalizedEmail?: string,
  ): Promise<Student> {
    const email = normalizedEmail ?? this.normalizeEmail(command.email);

    if (email !== student.email.getValue()?.toLowerCase()) {
      await this.studentDomainService.ensureEmailIsAvailable(
        this.studentRepo,
        email,
        student.id,
      );
    }

    if (command.phone !== student.phone.getValue()) {
      await this.studentDomainService.ensurePhoneIsAvailable(
        this.studentRepo,
        command.phone,
        student.id,
      );
    }

    student.update({
      firstName: command.firstName,
      lastName: command.lastName?.trim() || null,
      email,
      phone: command.phone,
      gender: command.gender,
      dateOfBirth: command.dateOfBirth,
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2,
      city: command.city,
      state: command.state,
      country: command.country,
      postalCode: command.postalCode,
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      jobStatus: StudentJobStatus.JOB_APPLIED,
      updatedBy: command.userId,
    });

    await this.studentRepo.save(student);

    return student;
  }

  private buildRemarks(
    command: CreateJobApplicationWithStudentCommand,
  ): string {
    return JSON.stringify({
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      addressLine1: command.addressLine1,
      addressLine2: command.addressLine2 ?? null,
      city: command.city,
      state: command.state,
      country: command.country,
      postalCode: command.postalCode,
    });
  }

  private assertResume(file: Express.Multer.File) {
    const mime = file.mimetype.trim().toLowerCase();
    const name = file.originalname.toLowerCase();

    if (
      !ALLOWED_RESUME_MIME_TYPES.has(mime) &&
      !name.endsWith('.pdf')
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Resume must be a PDF file.',
        400,
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Resume must be 10MB or smaller.',
        400,
      );
    }
  }
}
