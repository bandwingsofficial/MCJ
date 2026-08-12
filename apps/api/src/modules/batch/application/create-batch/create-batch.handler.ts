import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';
import type { BranchRepository } from '@modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@modules/student/domain/errors/branch-not-found.exception';

import { Slug } from '@common/value-objects/slug.vo';
import { BatchTrainer } from '../../domain/entities/batch-trainer.entity';
import { Batch } from '../../domain/entities/batch.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { CreateBatchCommand } from './create-batch.command';

export class CreateBatchHandler {
  private readonly logger = new Logger(CreateBatchHandler.name);

  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly courseRepo: CourseRepository,
    private readonly trainerRepo: TrainerRepository,
    private readonly branchRepo: BranchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: CreateBatchCommand,
  ): Promise<GetBatchResult> {
    await this.domainService.ensureCourseExists(
      this.courseRepo,
      command.courseId,
    );

    if (command.branchId) {
  const branch = await this.branchRepo.findById(
    command.branchId,
  );

  if (!branch) {
    throw new BranchNotFoundException(
      command.branchId,
    );
  }
}

    const trainerIds = this.domainService.uniqueIds(
      command.trainerIds,
    );
    await this.domainService.ensureTrainersExist(
      this.trainerRepo,
      trainerIds,
    );

    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromName(command.name).getValue();

    await this.domainService.ensureCodeIsAvailable(
      this.batchRepo,
      command.code,
    );
    await this.domainService.ensureSlugIsAvailable(
      this.batchRepo,
      slug
    );
    this.domainService.validateSchedule(command);

    const batchId = randomUUID();
    const batch = Batch.create({
      id: batchId,
      name: command.name,
      code: command.code,
      slug,
      description: command.description,
      courseId: command.courseId,
      branchId: command.branchId,
      startDate: command.startDate,
      endDate: command.endDate,
      startTime: command.startTime,
      endTime: command.endTime,
      daysOfWeek: command.daysOfWeek,
      capacity: command.capacity,
      enrolledCount: command.enrolledCount,
      mode: command.mode,
      classroom: command.classroom,
      meetingLink: command.meetingLink,
      isFeatured: command.isFeatured,
      status: command.status,
      trainers: trainerIds.map((trainerId) =>
        BatchTrainer.create({
          id: randomUUID(),
          batchId,
          trainerId,
        }),
      ),
      createdBy: command.createdBy,
    });

    await this.batchRepo.save(batch);

const savedBatch =
  await this.domainService.ensureExists(
    await this.batchRepo.findById(batch.id),
  );

this.logger.log(`✅ Batch created: ${batch.id}`);

return GetBatchResult.fromEntity(savedBatch);
  }
}
