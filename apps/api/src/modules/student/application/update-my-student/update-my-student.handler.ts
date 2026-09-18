import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { StudentRepository } from '../../domain/repositories/student.repository';
import { ResolveAuthenticatedStudentService } from '../../domain/services/resolve-authenticated-student.service';
import { StudentDomainService } from '../../domain/services/student-domain.service';
import { GetMyStudentResult } from '../get-my-student/get-my-student.result';

import { UpdateMyStudentCommand } from './update-my-student.command';

const STUDENT_UPLOAD_FOLDER = 'students';
const STUDENT_PROFILE_FILE_NAME = 'profile';

export class UpdateMyStudentHandler {
  constructor(
    private readonly studentRepo: StudentRepository,
    private readonly domainService: StudentDomainService,
    private readonly resolveAuthenticatedStudent: ResolveAuthenticatedStudentService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: UpdateMyStudentCommand,
  ): Promise<GetMyStudentResult> {
    const student = await this.domainService.ensureExists(
      await this.resolveAuthenticatedStudent.findByAuthenticatedUser(
        command.userId,
      ),
    );

    if (command.email !== undefined) {
      await this.domainService.ensureEmailIsAvailable(
        this.studentRepo,
        command.email,
        student.id,
      );
    }

    if (command.phone !== undefined) {
      await this.domainService.ensurePhoneIsAvailable(
        this.studentRepo,
        command.phone,
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
            updatedBy: command.userId,
          });

        nextProfileImageFileId = upload.id;
        nextProfileImageUrl = upload.url;
      } else {
        if (previousProfileImageFileId) {
          await this.uploadDomainService.softDelete(
            previousProfileImageFileId,
            command.userId,
          );
        }

        nextProfileImageFileId = null;
        nextProfileImageUrl = null;
      }
    }

    student.update({
      firstName: command.firstName,
      lastName:
        command.lastName === undefined
          ? undefined
          : command.lastName || null,
      email: command.email,
      phone: command.phone,
      gender: command.gender,
      dateOfBirth: command.dateOfBirth,
      addressLine1: command.addressLine1,
      addressLine2:
        command.addressLine2 === undefined
          ? undefined
          : command.addressLine2 || null,
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
      notes: command.notes,
      updatedBy: command.userId,
    });

    await this.studentRepo.save(student);

    return GetMyStudentResult.fromStudent(student);
  }
}
