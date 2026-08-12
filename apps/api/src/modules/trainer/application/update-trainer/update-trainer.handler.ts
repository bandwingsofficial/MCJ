import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { UpdateTrainerCommand } from './update-trainer.command';

const TRAINER_UPLOAD_FOLDER = 'trainers';
const TRAINER_PROFILE_FILE_NAME = 'profile';

export class UpdateTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: UpdateTrainerCommand,
  ): Promise<GetTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id),
    );

    await this.domainService.ensureEmailIsAvailable(
      this.trainerRepo,
      command.email,
      trainer.id,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.trainerRepo,
      command.phone,
    );

    await this.domainService.ensureEmployeeCodeIsAvailable(
      this.trainerRepo,
      command.employeeCode,
      trainer.id,
    );

    const previousProfileImageFileId = trainer.profileImageFileId;
    let nextProfileImageFileId = trainer.profileImageFileId;
    let nextProfileImageUrl = trainer.profileImageUrl;

    if (
      command.profileImageFileId !== undefined &&
      command.profileImageFileId !== previousProfileImageFileId
    ) {
      if (command.profileImageFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: previousProfileImageFileId,
            nextUploadId: command.profileImageFileId,
            folder: TRAINER_UPLOAD_FOLDER,
            entityId: trainer.id,
            fileName: TRAINER_PROFILE_FILE_NAME,
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

    trainer.update({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      phone: command.phone,
      gender: command.gender,
      bio: command.bio,
      qualification: command.qualification,
      experienceYears: command.experienceYears,
      specialization: command.specialization,
      skills: command.skills,
      profileImageFileId: nextProfileImageFileId,
      profileImageUrl: nextProfileImageUrl,
      employeeCode: command.employeeCode,
      trainerType: command.trainerType,
      linkedInUrl: command.linkedInUrl,
      youtubeUrl: command.youtubeUrl,
      instagramUrl: command.instagramUrl,
      branchId: command.branchId,
      averageRating: command.averageRating,
      totalReviews: command.totalReviews,
      isFeatured: command.isFeatured,
      joinedAt: command.joinedAt,
      updatedBy: command.updatedBy,
    });

    await this.trainerRepo.save(trainer);

    return GetTrainerResult.fromEntity(trainer);
  }
}
