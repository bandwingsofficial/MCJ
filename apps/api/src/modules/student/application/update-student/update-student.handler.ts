import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetStudentResult } from '../get-student/get-student.result';
import { StudentAdmissionStatusSyncService } from '../shared/student-admission-status-sync.service';

import { UpdateStudentCommand } from './update-student.command';

const STUDENT_UPLOAD_FOLDER = 'students';
const STUDENT_PROFILE_FILE_NAME = 'profile';

export class UpdateStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly branchRepo: BranchRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: StudentDomainService,
    private readonly admissionStatusSync: StudentAdmissionStatusSyncService,
  ) {}

  async execute(
    command: UpdateStudentCommand,
  ): Promise<GetStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.studentRepo.findById(command.id),
    );

    this.domainService.ensureBranchAccess(
      student,
      command.actorBranchId,
    );

    if (command.branchId) {
      await this.domainService.ensureBranchExists(
        this.branchRepo,
        command.branchId,
      );
    }

    await this.domainService.ensureEmailIsAvailable(
      this.studentRepo,
      command.email,
      student.id,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.studentRepo,
      command.phone,
      student.id,
    );
    if (command.studentCode) {
      await this.domainService.ensureStudentCodeIsAvailable(
        this.studentRepo,
        command.studentCode,
        student.id,
      );
    }

    const previousProfileImageFileId = student.profileImageFileId;
    let nextProfileImageFileId = student.profileImageFileId;
    let nextProfileImageUrl = student.profileImageUrl;

    if (
      command.profileImageFileId !== undefined &&
      command.profileImageFileId !== previousProfileImageFileId
    ) {
      if (command.profileImageFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: previousProfileImageFileId,
            nextUploadId: command.profileImageFileId,
            folder: STUDENT_UPLOAD_FOLDER,
            entityId: student.id,
            fileName: STUDENT_PROFILE_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextProfileImageFileId = upload.id;
        nextProfileImageUrl = upload.url;
      } else {
        if (previousProfileImageFileId) {
          await this.uploadDomainService.softDelete(
            previousProfileImageFileId,
            command.updatedBy,
          );
        }

        nextProfileImageFileId = null;
        nextProfileImageUrl = null;
      }
    }

    const shouldSyncAdmissionStatus =
      command.status !== undefined &&
      command.status !== student.status &&
      this.admissionStatusSync.isAdmissionSyncStatus(command.status);

    student.update({
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
      profileImageFileId: nextProfileImageFileId,
      profileImageUrl: nextProfileImageUrl,
      qualification: command.qualification,
      collegeName: command.collegeName,
      specialization: command.specialization,
      passingYear: command.passingYear,
      parentName: command.parentName,
      parentPhone: command.parentPhone,
      emergencyContactName: command.emergencyContactName,
      emergencyContactPhone: command.emergencyContactPhone,
      studentCode: command.studentCode,
      admissionDate: command.admissionDate,
      branchId: command.branchId,
      notes: command.notes,
      status: shouldSyncAdmissionStatus ? undefined : command.status,
      updatedBy: command.updatedBy,
    });

    await this.studentRepo.save(student);

    if (shouldSyncAdmissionStatus && command.status) {
      const synced = await this.admissionStatusSync.applyStudentAdmissionStatus(
        {
          student: (await this.studentRepo.findById(student.id)) ?? student,
          targetStatus: command.status,
          updatedBy: command.updatedBy,
          actorBranchId: command.actorBranchId,
        },
      );

      return GetStudentResult.fromEntity(synced);
    }

    return GetStudentResult.fromEntity(student);
  }
}
