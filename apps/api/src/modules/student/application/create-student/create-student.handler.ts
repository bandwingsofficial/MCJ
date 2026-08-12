import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

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
  ) {}

  async execute(command: CreateStudentCommand): Promise<GetStudentResult> {
    await this.domainService.ensureBranchExists(
      this.branchRepo,
      command.branchId,
    );
    await this.domainService.ensureEmailIsAvailable(
      this.studentRepo,
      command.email,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.studentRepo,
      command.phone,
    );

    const studentCode =
      await this.domainService.generateUniqueStudentCode(
        this.studentRepo,
      );

    const studentId = randomUUID();
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
      userId: command.userId ?? command.createdBy!,
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
      branchId: command.branchId,
      notes: command.notes,
      status: command.status,
      createdBy: command.createdBy,
    });

    await this.studentRepo.save(student);

    this.logger.log(`✅ Student created: ${student.id}`);

    return GetStudentResult.fromEntity(student);
  }
}
