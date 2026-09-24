import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';
import { syncLinkedBranchUserNamesFromTrainer } from '@modules/branch-user/infrastructure/linked-trainer-display.util';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type { TrainerUpdateParams } from '../../domain/entities/trainer.entity';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { UpdateTrainerCommand } from './update-trainer.command';

const TRAINER_UPLOAD_FOLDER = 'trainers';
const TRAINER_PROFILE_FILE_NAME = 'profile';

/**
 * Nullable text column semantics for PATCH:
 * - undefined  → field not provided, leave the stored value unchanged
 * - null / ""  → field explicitly cleared, store NULL
 * - otherwise  → store the trimmed value
 */
function toNullableText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
}

export class UpdateTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: TrainerDomainService,
    private readonly prisma: PrismaService,
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
      trainer.id,
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

    const patch: TrainerUpdateParams = {
      updatedBy: command.updatedBy,
      profileImageFileId: nextProfileImageFileId,
      profileImageUrl: nextProfileImageUrl,
    };

    const lastName = toNullableText(command.lastName);
    const bio = toNullableText(command.bio);
    const qualification = toNullableText(command.qualification);
    const specialization = toNullableText(command.specialization);
    const linkedInUrl = toNullableText(command.linkedInUrl);
    const youtubeUrl = toNullableText(command.youtubeUrl);
    const instagramUrl = toNullableText(command.instagramUrl);

    if (command.firstName !== undefined) {
      patch.firstName = command.firstName;
    }
    if (lastName !== undefined) {
      patch.lastName = lastName;
    }
    if (command.email !== undefined) {
      patch.email = command.email;
    }
    if (command.phone !== undefined) {
      patch.phone = command.phone;
    }
    if (command.gender !== undefined) {
      patch.gender = command.gender;
    }
    if (bio !== undefined) {
      patch.bio = bio;
    }
    if (qualification !== undefined) {
      patch.qualification = qualification;
    }
    if (command.experienceYears !== undefined) {
      patch.experienceYears = command.experienceYears;
    }
    if (specialization !== undefined) {
      patch.specialization = specialization;
    }
    if (command.skills !== undefined) {
      patch.skills = command.skills;
    }
    if (command.employeeCode !== undefined) {
      patch.employeeCode = command.employeeCode;
    }
    if (command.trainerType !== undefined) {
      patch.trainerType = command.trainerType;
    }
    if (linkedInUrl !== undefined) {
      patch.linkedInUrl = linkedInUrl;
    }
    if (youtubeUrl !== undefined) {
      patch.youtubeUrl = youtubeUrl;
    }
    if (instagramUrl !== undefined) {
      patch.instagramUrl = instagramUrl;
    }
    if (command.branchId !== undefined) {
      patch.branchId = command.branchId;
    }
    if (command.averageRating !== undefined) {
      patch.averageRating = command.averageRating;
    }
    if (command.totalReviews !== undefined) {
      patch.totalReviews = command.totalReviews;
    }
    if (command.isFeatured !== undefined) {
      patch.isFeatured = command.isFeatured;
    }
    if (command.joinedAt !== undefined) {
      patch.joinedAt = command.joinedAt;
    }

    trainer.update(patch);

    await this.trainerRepo.save(trainer);

    if (command.firstName !== undefined || lastName !== undefined) {
      await syncLinkedBranchUserNamesFromTrainer(this.prisma, trainer.id);
    }

    return GetTrainerResult.fromEntity(trainer);
  }
}
