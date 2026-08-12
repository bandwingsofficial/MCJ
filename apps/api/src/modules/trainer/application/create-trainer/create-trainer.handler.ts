import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { TrainerCourse } from '../../domain/entities/trainer-course.entity';
import { Trainer } from '../../domain/entities/trainer.entity';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { CreateTrainerCommand } from './create-trainer.command';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

const TRAINER_UPLOAD_FOLDER = 'trainers';
const TRAINER_PROFILE_FILE_NAME = 'profile';

export class CreateTrainerHandler {
  private readonly logger = new Logger(CreateTrainerHandler.name);

  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly courseRepo: CourseRepository,
    private readonly domainService: TrainerDomainService,
    private readonly branchRepo: BranchRepository,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateTrainerCommand,
  ): Promise<GetTrainerResult> {
    if (command.branchId) {
      const branch = await this.branchRepo.findById(command.branchId);

      if (!branch) {
        throw new BranchNotFoundException(command.branchId);
      }
    }

    await this.domainService.ensureEmailIsAvailable(
      this.trainerRepo,
      command.email,
    );
    await this.domainService.ensurePhoneIsAvailable(
      this.trainerRepo,
      command.phone,
    );

    await this.domainService.ensureEmployeeCodeIsAvailable(
      this.trainerRepo,
      command.employeeCode,
    );

    const courseIds = this.domainService.uniqueCourseIds(
      command.courseIds,
    );

    await this.domainService.ensureCoursesExist(
      this.courseRepo,
      courseIds,
    );

    const trainerId = randomUUID();
    let profileImageFileId: string | null = null;
    let profileImageUrl: string | null = null;

    if (command.profileImageFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.profileImageFileId,
        folder: TRAINER_UPLOAD_FOLDER,
        entityId: trainerId,
        fileName: TRAINER_PROFILE_FILE_NAME,
      });

      profileImageFileId = upload.id;
      profileImageUrl = upload.url;
    }

    const trainer = Trainer.create({
      id: trainerId,
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
      profileImageFileId,
      profileImageUrl,
      employeeCode: command.employeeCode,
      trainerType: command.trainerType,
      linkedInUrl: command.linkedInUrl,
      youtubeUrl: command.youtubeUrl,
      instagramUrl: command.instagramUrl,
      branchId: command.branchId,
      averageRating: command.averageRating,
      totalReviews: command.totalReviews,
      isFeatured: command.isFeatured,
      status: command.status,
      joinedAt: command.joinedAt,
      courses: courseIds.map((courseId) =>
        TrainerCourse.create({
          id: randomUUID(),
          trainerId,
          courseId,
        }),
      ),
      createdBy: command.createdBy,
    });

    await this.trainerRepo.save(trainer);

    const savedTrainer = await this.trainerRepo.findById(
      trainer.id,
      true,
    );

    if (!savedTrainer) {
      throw new Error(
        `Trainer ${trainer.id} not found after creation`,
      );
    }

    this.logger.log(`✅ Trainer created: ${trainer.id}`);

    return GetTrainerResult.fromEntity(savedTrainer);
  }
}
